import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {StoreDTO} from '@app/models/store.dto';
import {FavoriteStoreDTO} from '@app/models/favorite-store.dto';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteStoresService {
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

  getFavoriteStores(userId: string): Observable<FavoriteStoreDTO[]> {
    return this.http.get<FavoriteStoreDTO[]>(`${this.apiUrl}/${userId}/favorite-stores`)
      .pipe(catchError(this.handleError));
  }

  searchStores(userId: string, query: string): Observable<StoreDTO[]> {
    return this.http.get<StoreDTO[]>(`${this.apiUrl}/${userId}/stores/search`, {
      params: {query}
    }).pipe(catchError(this.handleError));
  }

  addFavoriteStore(userId: string, storeId: string): Observable<FavoriteStoreDTO> {
    return this.http.post<FavoriteStoreDTO>(`${this.apiUrl}/${userId}/favorite-stores/${storeId}`, {})
      .pipe(catchError(this.handleError));
  }

  removeFavoriteStore(userId: string, storeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/favorite-stores/${storeId}`)
      .pipe(catchError(this.handleError));
  }
}
