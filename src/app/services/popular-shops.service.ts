import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PopularShopDataItem {
  shop: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class PopularShopsService {
  getPopularShopsData(): Observable<PopularShopDataItem[]> {
    return of([
      { shop: 'Bingo',       value: 10 },
      { shop: 'Mercator',    value: 12 },
      { shop: 'Konzum',      value: 8 },
      { shop: 'BEST',        value: 14 },
      { shop: 'Amko Komerc', value: 9 },
      { shop: 'Hoše Komerc', value: 11 }
    ]);
  }
}
