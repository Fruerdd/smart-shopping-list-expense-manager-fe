import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface IMoneySpent { month: string; thisYear: number; lastYear: number; }
export interface IPriceAverage { item: string; avgPrice: number; }
export interface IStoreExpense { store: string; pct: number; }
export interface ISaving { month: string; amount: number; }
export interface ICategorySpend { category: string; spent: number; }

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  getMoneySpent(): Observable<IMoneySpent[]> {
    return of([
      { month:'Jan', thisYear:1200, lastYear: 800 },
      { month:'Feb', thisYear: 900, lastYear:1000 },
      { month:'Mar', thisYear:1300, lastYear:2000 },
      { month:'Apr', thisYear:2500, lastYear:1500 },
      { month:'May', thisYear:2200, lastYear: 800 },
      { month:'Jun', thisYear:1800, lastYear:2100 },
      { month:'Jul', thisYear:2300, lastYear:2600 },
    ]);
  }

  getPriceAverages(): Observable<IPriceAverage[]> {
    return of([
      { item:'Coffee',  avgPrice:  9 },
      { item:'Red Meat',avgPrice: 15 },
      { item:'Chocolate',avgPrice:11 },
      { item:'Wine',    avgPrice:18 },
      { item:'Bread',   avgPrice: 6 },
      { item:'Oil',     avgPrice:13 },
    ]);
  }

  getStoreExpenses(): Observable<IStoreExpense[]> {
    return of([
      { store:'Mercator', pct: 52.1 },
      { store:'Konzum',   pct: 22.8 },
      { store:'Bingo',    pct: 13.9 },
      { store:'Other',    pct: 11.2 },
    ]);
  }

  getSavings(): Observable<ISaving[]> {
    return of([
      { month:'Jan', amount:170 },
      { month:'Feb', amount:300 },
      { month:'Mar', amount:210 },
      { month:'Apr', amount:320 },
      { month:'May', amount:130 },
      { month:'Jun', amount:260 },
      { month:'Jul', amount:180 },
      { month:'Aug', amount:280 },
      { month:'Sep', amount:220 },
      { month:'Oct', amount:330 },
      { month:'Nov', amount:140 },
      { month:'Dec', amount:250 },
    ]);
  }

  getCategorySpending(): Observable<ICategorySpend[]> {
    return of([
      { category:'Dairy',      spent: 25 },
      { category:'Beverages',  spent: 40 },
      { category:'Sweets',     spent: 15 },
      { category:'Vegetables', spent: 60 },
      { category:'Meat',       spent: 30 },
      { category:'Fruit',      spent: 50 },
    ]);
  }
}
