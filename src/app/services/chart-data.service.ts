import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {environment} from 'src/environments/environment';


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
  private base = environment.apiUrl;
  private readonly statsUrl = `${this.base}/api/stats`;

  constructor(private http: HttpClient) {
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
}
