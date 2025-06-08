import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {forkJoin, map, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ShoppingListDTO} from '../models/shopping-list.dto';
import {ShoppingListItemDTO} from '../models/shopping-list-item.dto';
import {CollaboratorDTO} from '../models/collaborator.dto';
import {StorePriceDTO} from '../models/store-price.dto';
import {StoreDTO} from '../models/store.dto';
import {ProductDTO} from '../models/product.dto';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      try {
        // Try to parse error as JSON if it's a string
        const errorBody = typeof error.error === 'string' ?
          (error.error.startsWith('{') ? JSON.parse(error.error) : {message: error.error})
          : error.error;

        if (error.status === 404) {
          errorMessage = `Resource not found: ${errorBody.message || 'The requested resource was not found'}`;
        } else if (error.status === 500) {
          errorMessage = `Server error: ${errorBody.message || error.error || 'An internal server error occurred'}`;
        } else {
          errorMessage = errorBody.message || error.message || 'Unknown error occurred';
        }
      } catch (e) {
        // If parsing fails, use the raw error message
        errorMessage = typeof error.error === 'string' ?
          error.error :
          `Server error (${error.status}): ${error.message}`;
      }
    }

    console.error('API Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  // Shopping List Operations
  getShoppingLists(userId: string): Observable<ShoppingListDTO[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/shopping-lists`).pipe(
      map(lists => lists.map(list => this.mapShoppingListResponse(list))),
      map(lists => lists.filter(list => list.active)),
      switchMap(lists => {
        if (lists.length === 0) {
          return of([]);
        }
        return forkJoin(lists.map(list => this.refreshListPrices(list)));
      }),
      catchError(error => {
        console.error('Error fetching shopping lists:', error);
        return of([]);
      })
    );
  }

  getShoppingListById(userId: string, listId: string): Observable<ShoppingListDTO> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/shopping-lists/${listId}`).pipe(
      map(list => this.mapShoppingListResponse(list)),
      switchMap(list => this.refreshListPrices(list)),
      catchError(this.handleError)
    );
  }

  private mapShoppingListResponse(rawList: any): ShoppingListDTO {
    return {
      ...rawList,
      items: rawList.items?.map((item: any) => ({
        ...item,
        isChecked: item.checked !== undefined ? item.checked : false
      })) || []
    };
  }

  private refreshListPrices(list: ShoppingListDTO): Observable<ShoppingListDTO> {
    if (!list.items || list.items.length === 0) {
      return of(list);
    }

    const priceRequests = list.items.map(item =>
      this.getProductPrices(list.ownerId, item.productId).pipe(
        map(prices => {
          if (prices && prices.length > 0) {
            // Use the price from the store that matches the item's store, or the first available price
            const storePrice = prices.find(p => p.storeName === item.storeName) || prices[0];
            return {
              ...item,
              price: storePrice.price,
              isChecked: item.isChecked !== undefined ? item.isChecked : false
            };
          }
          return {
            ...item,
            isChecked: item.isChecked !== undefined ? item.isChecked : false
          };
        })
      )
    );

    return forkJoin(priceRequests).pipe(
      map(updatedItems => ({
        ...list,
        items: updatedItems
      }))
    );
  }

  createShoppingList(userId: string, shoppingList: Partial<ShoppingListDTO>): Observable<ShoppingListDTO> {
    return this.http.post<ShoppingListDTO>(`${this.apiUrl}/${userId}/shopping-lists`, shoppingList);
  }

  updateShoppingList(userId: string, listId: string, shoppingList: Partial<ShoppingListDTO>): Observable<ShoppingListDTO> {
    return this.http.put<ShoppingListDTO>(`${this.apiUrl}/${userId}/shopping-lists/${listId}`, shoppingList);
  }

  deleteShoppingList(userId: string, listId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/shopping-lists/${listId}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Shopping List Item Operations
  updateShoppingListItem(userId: string, listId: string, itemId: string, item: ShoppingListItemDTO): Observable<ShoppingListItemDTO> {

    const updatePayload: Partial<ShoppingListItemDTO> = {
      id: itemId,
      isChecked: item.isChecked
    };

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http.put<ShoppingListItemDTO>(
      `${this.apiUrl}/${userId}/shopping-lists/${listId}/items/${itemId}`,
      updatePayload,
      {headers}
    ).pipe(
      tap(response => {
        if (!response) {
          console.warn('Empty response received from server');
          return;
        }
      }),
      catchError(error => {
        console.error('Error updating item:', error);
        if (error.error) {
          console.error('Error body:', error.error);
        }
        return this.handleError(error);
      })
    );
  }

  // Collaborator Operations
  addCollaborator(userId: string, listId: string, collaborator: CollaboratorDTO): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${userId}/shopping-lists/${listId}/collaborators`,
      collaborator
    );
  }

  updateCollaborator(userId: string, listId: string, collaboratorId: string, collaborator: CollaboratorDTO): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${userId}/shopping-lists/${listId}/collaborators/${collaboratorId}`,
      collaborator
    ).pipe(catchError(this.handleError));
  }

  removeCollaborator(userId: string, listId: string, collaboratorId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${userId}/shopping-lists/${listId}/collaborators/${collaboratorId}`
    );
  }

  // Product Operations
  searchProducts(userId: string, query: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.apiUrl}/${userId}/products/search`, {
      params: {query}
    });
  }

  getAllProducts(userId: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.apiUrl}/${userId}/products`);
  }

  getProductPrices(userId: string, productId: string): Observable<StorePriceDTO[]> {
    return this.http.get<StorePriceDTO[]>(
      `${this.apiUrl}/${userId}/products/${productId}/prices`
    );
  }

  // Store Operations
  searchStores(userId: string, query: string): Observable<StoreDTO[]> {
    return this.http.get<StoreDTO[]>(`${this.apiUrl}/${userId}/stores/search`, {
      params: {query}
    });
  }

  getAllStores(userId: string): Observable<StoreDTO[]> {
    return this.http.get<StoreDTO[]>(`${this.apiUrl}/${userId}/stores`);
  }
}
