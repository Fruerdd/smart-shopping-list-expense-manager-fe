
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IProduct {
  rank:        number;
  productName: string;
  price:       number;
  stock:       number;
  store:       string;
}

export interface BulkResultDTO {
  success: boolean;
  errors?: string[];
  count:   number;
}

export interface IDailySearch {
  day:      string;   // e.g. "2024-10-06"
  searches: number;
}

export interface IMonthlyProductAdd {
  month:      string; // e.g. "2024-10"
  addedCount: number;
}

export interface AddProductPayload {
  storePriceId?: string;  
  storeId:     string;
  productId?:  string;    
  productName: string;   
  category?:   any;       
  description?: string;   
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

  /** bulk create/update → now returns your JSON result DTO */
  bulkAddProducts(payload: AddProductPayload[]): Observable<BulkResultDTO> {
    return this.http.post<BulkResultDTO>(`${this.base}/bulk`, payload);
  }

  getTopProducts(): Observable<ITopProduct[]> {
    return this.http.get<ITopProduct[]>(`${this.analyticsBase}/top`);
  }

  getDailySearches(): Observable<IDailySearch[]> {
    return this.http.get<IDailySearch[]>(`${this.analyticsBase}/daily-searches`);
  }

  getWeeklySearches(): Observable<IDailySearch[]> {
    return this.http.get<IDailySearch[]>(`${this.analyticsBase}/weekly-searches`);
  }

  getMonthlyAdds(): Observable<IMonthlyProductAdd[]> {
    return this.http.get<IMonthlyProductAdd[]>(`${this.analyticsBase}/monthly-adds`);
  }
}
