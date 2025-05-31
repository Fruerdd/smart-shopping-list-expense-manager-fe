import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';


export interface IChartData {
  labels: string[];
  datasets: { data: number[]; backgroundColor: string[] }[];
}

export interface CityAllocationDTO {
  labels: string[];
  data: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private base = environment;
  private readonly statsUrl = `${this.base}/api/stats`;

  constructor (private http: HttpClient) {}
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
    return this.http
      .get<CityAllocationDTO>(`${this.statsUrl}/city-allocation`)
      .pipe(
        map(dto => ({
          labels: dto.labels,
          datasets: [
            {
              data: dto.data,
              // you can choose colors however you like, or generate them dynamically
              backgroundColor: [
                '#6c63ff',
                '#f3722c',
                '#f9c74f',
                '#43aa8b',
                '#577590'
              ]
            }
          ]
        }))
      );
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
