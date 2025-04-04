import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Item {
  id: number;
  name: string;
}

export interface StorePrice {
  storeId: number;
  storeName: string;
  storeIcon: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class PriceComparisonService {
  private mockItems: Item[] = [
    { id: 1, name: 'Chocolate' },
    { id: 2, name: 'Milk' },
    { id: 3, name: 'Cola' },
    { id: 4, name: 'Bread' },
    { id: 5, name: 'Eggs' },
    { id: 6, name: 'Butter' }
  ];

  private mockStorePrices: { [key: number]: StorePrice[] } = {
    1: [
      { storeId: 1, storeName: 'Mercator', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#f44336"/></svg>', price: 7.99 },
      { storeId: 2, storeName: 'Konzum', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#e91e63"/></svg>', price: 7.99 },
      { storeId: 3, storeName: 'Bingo', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#4caf50"/></svg>', price: 8.99 }
    ],
    2: [
      { storeId: 1, storeName: 'Mercator', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#f44336"/></svg>', price: 1.29 },
      { storeId: 2, storeName: 'Konzum', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#e91e63"/></svg>', price: 1.19 },
      { storeId: 3, storeName: 'Bingo', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#4caf50"/></svg>', price: 1.25 },
      { storeId: 4, storeName: 'Lidl', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#2196f3"/></svg>', price: 1.15 }
    ],
    3: [
      { storeId: 1, storeName: 'Mercator', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#f44336"/></svg>', price: 2.49 },
      { storeId: 2, storeName: 'Konzum', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#e91e63"/></svg>', price: 2.29 },
      { storeId: 3, storeName: 'Bingo', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#4caf50"/></svg>', price: 2.59 }
    ]
  };

  constructor() { }

  getAllItems(): Observable<Item[]> {

    return of(this.mockItems);
  }

  getItemPrices(itemId: number): Observable<StorePrice[]> {

    return of(this.mockStorePrices[itemId] || []);
  }
}
