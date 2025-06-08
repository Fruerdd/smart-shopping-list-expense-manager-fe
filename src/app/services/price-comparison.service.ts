import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProductDTO} from '@app/models/product.dto';
import {StorePriceDTO} from '@app/models/store-price.dto';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PriceComparisonService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {
  }

  getAllItems(userId: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.apiUrl}/${userId}/products`);
  }

  getItemPrices(userId: string, productId: string): Observable<StorePriceDTO[]> {
    return this.http.get<StorePriceDTO[]>(`${this.apiUrl}/${userId}/products/${productId}/prices`);
  }
}
