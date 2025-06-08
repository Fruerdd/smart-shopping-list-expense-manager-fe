import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ProductDTO} from '@app/models/product.dto';
import {FavoriteProductDTO} from '@app/models/favorite-product.dto';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteProductsService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      try {
        const errorBody = typeof error.error === 'string' ?
          (error.error.startsWith('{') ? JSON.parse(error.error) : {message: error.error})
          : error.error;
        errorMessage = errorBody.message || error.message || 'Unknown error occurred';
      } catch (e) {
        errorMessage = typeof error.error === 'string' ?
          error.error :
          `Server error (${error.status}): ${error.message}`;
      }
    }

    console.error('API Error:', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  searchProducts(userId: string, query: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.apiUrl}/${userId}/products/search`, {
      params: {query}
    }).pipe(catchError(this.handleError));
  }

  getFavoriteProducts(userId: string): Observable<FavoriteProductDTO[]> {
    return this.http.get<FavoriteProductDTO[]>(`${this.apiUrl}/${userId}/favorite-products`)
      .pipe(catchError(this.handleError));
  }

  addFavoriteProduct(userId: string, productId: string): Observable<FavoriteProductDTO> {
    return this.http.post<FavoriteProductDTO>(`${this.apiUrl}/${userId}/favorite-products/${productId}`, {})
      .pipe(catchError(this.handleError));
  }

  removeFavoriteProduct(userId: string, productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/favorite-products/${productId}`)
      .pipe(catchError(this.handleError));
  }
}
