import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly base = 'http://localhost:8080/api/stores';

  constructor(private http: HttpClient) {}

  getStores(): Observable<StoreDTO[]> {
    return this.http
      .get<{ id: string; name: string; icon: string }[]>(this.base)
      .pipe(map(list =>
        list.map(s => ({ storeId: s.id, name: s.name, icon: s.icon }))
      ));
  }

  getStore(id: string): Observable<StoreDetailsDTO> {
    return this.http
      .get<{ id: string; name: string; icon: string; location: string; contact: string; createdAt: string }>(
        `${this.base}/${id}`
      )
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
    return this.http.get<StorePriceDTO[]>(`${this.base}/${id}/products`);
  }
}
