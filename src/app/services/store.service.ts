import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


/** basic store info */
export interface StoreDTO {
  storeId: string;
  name:    string;
  icon:    string;
}

/** full store details */
export interface StoreDetailsDTO extends StoreDTO {
  location:  string;
  contact:   string;
  createdAt: string;
}

/**
 * Now carries every field your edit form needs:
 * - storePriceId & productId so updates target the correct rows
 * - flat productName, category, description, isActive, price, barcode
 */
export interface StorePriceDTO {
  storePriceId: string;
  storeId:      string;
  productId:    string;
  productName:  string;
  category:     string;
  description:  string;
  isActive:     boolean;
  price:        number;
  barcode?:     string;
}

/** payload shape for create/update (no storeId, no createdAt) */
export interface StoreUpsertPayload {
  name:     string;
  icon:     string;
  location: string;
  contact:  string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private base = environment.apiUrl;
  private readonly apiUrl = `${this.base}/api/stores`;
  constructor(private http: HttpClient) {}

  /** — existing methods — */

  getStores(): Observable<StoreDTO[]> {
    return this.http
      .get<{ id: string; name: string; icon: string }[]>(this.apiUrl)
      .pipe(map(list =>
        list.map(s => ({ storeId: s.id, name: s.name, icon: s.icon }))
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
        storeId:   dto.id,
        name:      dto.name,
        icon:      dto.icon,
        location:  dto.location,
        contact:   dto.contact,
        createdAt: dto.createdAt
      })));
  }

  /** Now returns the extended StorePriceDTO shape */
  getStoreProducts(id: string): Observable<StorePriceDTO[]> {
    return this.http.get<StorePriceDTO[]>(`${this.apiUrl}/${id}/products`);
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
        storeId:   dto.id,
        name:      dto.name,
        icon:      dto.icon,
        location:  dto.location,
        contact:   dto.contact,
        createdAt: dto.createdAt
      })));
  }

  /**
   * Update an existing store.
   * @param id       UUID of the store to update
   * @param payload  name, icon, location, contact
   * @returns        the updated StoreDetailsDTO
   */
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
        storeId:   dto.id,
        name:      dto.name,
        icon:      dto.icon,
        location:  dto.location,
        contact:   dto.contact,
        createdAt: dto.createdAt
      })));
  }
}
