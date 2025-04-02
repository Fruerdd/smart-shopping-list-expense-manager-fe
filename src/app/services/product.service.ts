import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface IProduct {
  rank: number;
  productName: string;
  price: number;
  stock: string; 
  store: string;
}

export interface ILeftChartData {
  Day: string;
  Searches: number;
}

export interface IRightChartData {
  Month: string;
  Value: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  getTopProducts(): Observable<IProduct[]> {
    return of([
      { rank: 1, productName: 'Tomato "Roma"', price: 1.99, stock: '34,866 Piece', store: 'Mercator' },
      { rank: 2, productName: 'Banana "Baby"', price: 2.49, stock: '20,000 Piece', store: 'Bingo' },
      { rank: 3, productName: 'Lettuce "Iceberg"', price: 0.99, stock: '15,000 Piece', store: 'Konzum' },
      { rank: 4, productName: 'Carrot "Organic"', price: 1.29, stock: '10,000 Piece', store: 'BEST' },
      { rank: 5, productName: 'Potato "Russet"', price: 1.59, stock: '5,000 Piece', store: 'Amko Komerc' }
    ]);
  }

  getLeftChartData(): Observable<ILeftChartData[]> {
    return of([
      { Day: 'Mon', Searches: 300 },
      { Day: 'Tue', Searches: 400 },
      { Day: 'Wed', Searches: 500 },
      { Day: 'Thu', Searches: 600 },
      { Day: 'Fri', Searches: 550 },
      { Day: 'Sat', Searches: 620 },
      { Day: 'Sun', Searches: 700 }
    ]);
  }

  getRightChartData(): Observable<IRightChartData[]> {
    return of([
      { Month: 'Jan', Value: 10 },
      { Month: 'Feb', Value: 15 },
      { Month: 'Mar', Value: 20 },
      { Month: 'Apr', Value: 22 },
      { Month: 'May', Value: 30 }
    ]);
  }

  getTotalProductSearched(): Observable<number> {
    return of(500874);
  }

  getNewAdded(): Observable<number> {
    return of(100);
  }
}
