// src/app/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Top‐selling product for analytics table */
export interface IProduct {
  rank:        number;
  productName: string;
  price:       number;
  stock:       number;
  store:       string;
}

/** Data point for “Daily Searches” spline chart */
export interface IDailySearch {
  day:      string;   // e.g. "2024-10-06"
  searches: number;
}

/** Data point for “Monthly Product Adds” bar chart */
export interface IMonthlyProductAdd {
  month:      string; // e.g. "2024-10"
  addedCount: number;
}

/** Payload for bulk‐adding products (manual form or CSV) */
export interface AddProductPayload {
  storePriceId?: string;  // optional on create vs. update
  storeId:     string;
  productId?:  string;    // optional on create vs. update
  productName: string;    // always required by backend
  category?:   any;       // ← now optional & can be null
  description?: string;   // ← now optional
  price:       number;
  barcode:     string;
  isActive:    boolean;
}

export interface ITopProduct {
  rank:        number;
  productName: string;
  price:       number;
  searchCount: number;
  storeName:   string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = 'http://localhost:8080/api/products';
  private readonly analyticsBase = `${this.base}/analytics`;

  constructor(private http: HttpClient) {}

  //
  // BULK‐ADD endpoints
  //

  bulkAddProducts(payload: AddProductPayload[]): Observable<void> {
    return this.http.post<void>(`${this.base}/bulk`, payload);
  }

  //
  // ANALYTICS endpoints
  //

  getTopProducts(): Observable<ITopProduct[]> {
    return this.http.get<ITopProduct[]>(`${this.analyticsBase}/top`);
  }

  getDailySearches(): Observable<IDailySearch[]> {
    return this.http.get<IDailySearch[]>(`${this.analyticsBase}/daily-searches`);
  }

  /** NEW: searches per day over the last 7 days */
  getWeeklySearches(): Observable<IDailySearch[]> {
    return this.http.get<IDailySearch[]>(`${this.analyticsBase}/weekly-searches`);
  }

  getMonthlyAdds(): Observable<IMonthlyProductAdd[]> {
    return this.http.get<IMonthlyProductAdd[]>(`${this.analyticsBase}/monthly-adds`);
  }
}
