import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface IChartData {
    labels: string[];
    datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  getPopularShopsData(): Observable<IChartData> {
    return of({
      labels: ['Bingo', 'Mercator', 'Konzum', 'BEST', 'Amko Komerc', 'Hoše Komerc'],
      datasets: [
        {
          data: [10, 12, 8, 14, 9, 11],
          backgroundColor: ['#6c63ff'] 
        }
      ]
    });
  }

  getCityAllocationData(): Observable<IChartData> {
    return of({
      labels: ['Sarajevo', 'Mostar', 'Tuzla', 'Zenica', 'Banja Luka'],
      datasets: [
        {
          data: [25, 20, 15, 25, 15],
          backgroundColor: ['#6c63ff', '#f3722c', '#f9c74f', '#43aa8b', '#577590']
        }
      ]
    });
  }

  getProductAddData(): Observable<IChartData> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          data: [10, 14, 12, 18, 16],
          backgroundColor: ['#6a4c93']
        }
      ]
    });
  }

  getUserSavingsData(): Observable<IChartData> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: [300, 450, 500, 600, 700, 650, 800, 900, 850, 950, 1000, 1100],
          backgroundColor: ['#6c63ff']
        }
      ]
    });
  }
}
