import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { map }          from 'rxjs/operators';
import { environment } from 'src/environments/environment';


export interface PopularShopDataItem {
  shop:  string;
  value: number;
}

interface PopularShopDTO {
  name:  string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class PopularShopsService {
  private base = environment.apiUrl;
  private readonly statsUrl = `${this.base}/api/stores`;

  constructor(private http: HttpClient) {}

  getPopularShopsData(): Observable<PopularShopDataItem[]> {
    return this.http
      .get<PopularShopDTO[]>(`${this.statsUrl}/popular`)
      .pipe(
        map(list =>
          list.map(d => ({
            shop:  d.name,
            value: d.count
          }))
        )
      );
  }
}
