import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShoppingListDTO } from '@app/models/shopping-list.dto';
import { CategoryDTO } from '@app/models/category.dto';
import { ShoppingListItemDTO } from '@app/models/shopping-list-item.dto';
import { StoreItemDTO } from '@app/models/store-item.dto';
import { StoreDTO } from '@app/models/store.dto';
import { CollaboratorDTO } from '@app/models/collaborator.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListPageService {
  private readonly apiUrl = `${environment.apiUrl}/api/shopping-lists`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.apiUrl}/categories`);
  }

  getSidebarCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.apiUrl}/sidebar-categories`);
  }

  getAllProducts(): Observable<ShoppingListItemDTO[]> {
    return this.http.get<ShoppingListItemDTO[]>(`${this.apiUrl}/products`);
  }

  getListById(id: string): Observable<ShoppingListDTO> {
    return this.http.get<ShoppingListDTO>(`${this.apiUrl}/${id}`);
  }

  getListsByUserId(userId: string): Observable<ShoppingListDTO[]> {
    return this.http.get<ShoppingListDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  createList(list: Partial<ShoppingListDTO>): Observable<ShoppingListDTO> {
    return this.http.post<ShoppingListDTO>(`${this.apiUrl}`, list);
  }

  updateList(id: string, updates: Partial<ShoppingListDTO>): Observable<ShoppingListDTO> {
    return this.http.put<ShoppingListDTO>(`${this.apiUrl}/${id}`, updates);
  }

  softDeleteList(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/soft-delete`, {});
  }

  getCollaborators(listId: string): Observable<CollaboratorDTO[]> {
    return this.http.get<CollaboratorDTO[]>(`${this.apiUrl}/${listId}/collaborators`);
  }

  searchProducts(term: string): Observable<ShoppingListItemDTO[]> {
    return this.http.get<ShoppingListItemDTO[]>(`${this.apiUrl}/products/search`, {
      params: { term }
    });
  }

  getProductsByCategory(categoryId: string): Observable<ShoppingListItemDTO[]> {
    return this.http.get<ShoppingListItemDTO[]>(`${this.apiUrl}/products/category/${categoryId}`);
  }

  getItemPriceComparisons(itemId: string): Observable<StoreItemDTO[]> {
    return this.http.get<StoreItemDTO[]>(`${this.apiUrl}/items/${itemId}/price-comparisons`);
  }

  getAllAvailableStores(): Observable<StoreDTO[]> {
    return this.http.get<StoreDTO[]>(`${this.apiUrl}/stores`);
  }

  updateShoppingList(id: string, shoppingListDTO: ShoppingListDTO): Observable<ShoppingListDTO> {
    return this.http.put<ShoppingListDTO>(`${this.apiUrl}/${id}/update`, shoppingListDTO);
  }
}
