import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';


export interface AvailableProductDTO {
  productId: string;
  productName: string;
  category: string;
  description: string;
  active: boolean;
}


export interface StoreDTO {
  storeId: string;
  name: string;
  icon: string;
}

export interface StoreDetailsDTO extends StoreDTO {
  location: string;
  contact: string;
  createdAt: string;
}

export interface StorePriceDTO {
  storePriceId: string;
  storeId: string;
  productId: string;
  productName: string;
  category: string;
  description: string;
  isActive: boolean;
  price: number;
  barcode?: string;
}

export interface StoreUpsertPayload {
  name: string;
  icon: string;
  location: string;
  contact: string;
}

@Injectable({providedIn: 'root'})
export class StoreService {
  private base = environment.apiUrl;
  private readonly apiUrl = `${this.base}/api/stores`;

  constructor(private http: HttpClient) {
  }

  getStores(): Observable<StoreDTO[]> {
    return this.http
      .get<{ id: string; name: string; icon: string }[]>(this.apiUrl)
      .pipe(map(list =>
        list.map(s => ({storeId: s.id, name: s.name, icon: s.icon}))
      ));
  }

  getStore(id: string): Observable<StoreDetailsDTO> {
    return this.http
      .get<{
        id: string;
        name: string;
        icon: string;
        location: string;
        contact: string;
        createdAt: string;
      }>(`${this.apiUrl}/${id}`)
      .pipe(map(dto => ({
        storeId: dto.id,
        name: dto.name,
        icon: dto.icon,
        location: dto.location,
        contact: dto.contact,
        createdAt: dto.createdAt
      })));
  }

  /** Now returns the extended StorePriceDTO shape */
  getStoreProducts(id: string): Observable<StorePriceDTO[]> {
    return this.http.get<StorePriceDTO[]>(`${this.apiUrl}/${id}/products`);
  }

  getAvailableProducts(storeId: string): Observable<AvailableProductDTO[]> {
    return this.http.get<AvailableProductDTO[]>(
      `${this.base}/api/stores/${storeId}/available-products`
    );
  }

  /** — new methods — */

  /**
   * Create a new store.
   * @param payload  name, icon, location, contact
   * @returns         the created StoreDetailsDTO
   */
  createStore(payload: StoreUpsertPayload): Observable<StoreDetailsDTO> {
    return this.http
      .post<{
        id: string;
        name: string;
        icon: string;
        location: string;
        contact: string;
        createdAt: string;
      }>(this.apiUrl, payload)
      .pipe(map(dto => ({
        storeId: dto.id,
        name: dto.name,
        icon: dto.icon,
        location: dto.location,
        contact: dto.contact,
        createdAt: dto.createdAt
      })));
  }

  updateStore(
    id: string,
    payload: StoreUpsertPayload
  ): Observable<StoreDetailsDTO> {
    return this.http
      .put<{
        id: string;
        name: string;
        icon: string;
        location: string;
        contact: string;
        createdAt: string;
      }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(dto => ({
        storeId: dto.id,
        name: dto.name,
        icon: dto.icon,
        location: dto.location,
        contact: dto.contact,
        createdAt: dto.createdAt
      })));
  }
}

