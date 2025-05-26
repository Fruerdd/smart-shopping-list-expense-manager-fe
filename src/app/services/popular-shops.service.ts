import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { map }          from 'rxjs/operators';

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
  private readonly base = 'http://localhost:8080/api/stores';

  constructor(private http: HttpClient) {}

  getPopularShopsData(): Observable<PopularShopDataItem[]> {
    return this.http
      .get<PopularShopDTO[]>(`${this.base}/popular`)
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
