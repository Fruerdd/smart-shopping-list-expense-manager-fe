// src/app/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import {
  IMoneySpent,
  IPriceAverage,
  IStoreExpense,
  ISaving,
  ICategorySpend
} from '@app/models/user.analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private base = environment;
  private readonly baseUrl = `${this.base}/api/profile`;

  constructor(private http: HttpClient) {}

  getMoneySpent(): Observable<IMoneySpent[]> {
    return this.http.get<IMoneySpent[]>(`${this.baseUrl}/money-spent`);
  }

  getPriceAverages(): Observable<IPriceAverage[]> {
    return this.http.get<IPriceAverage[]>(`${this.baseUrl}/price-averages`);
  }

  getStoreExpenses(): Observable<IStoreExpense[]> {
    return this.http.get<IStoreExpense[]>(`${this.baseUrl}/store-expenses`);
  }

  getSavings(): Observable<ISaving[]> {
    return this.http.get<ISaving[]>(`${this.baseUrl}/savings`);
  }

  getCategorySpending(): Observable<ICategorySpend[]> {
    return this.http.get<ICategorySpend[]>(`${this.baseUrl}/category-spending`);
  }
}
