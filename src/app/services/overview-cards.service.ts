// overview-cards.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export interface OverviewDataItem {
  title:  string;
  value:  number;
  change: string;
}

@Injectable({ providedIn: 'root' })
export class OverviewCardsService {
  private base = environment.apiUrl;
  private readonly statsUrl = `${this.base}/api/stats`;

  constructor(private http: HttpClient) {}

  getOverviewData(period: 'today' | 'lastWeek'): Observable<OverviewDataItem[]> {
    return this.http.get<OverviewDataItem[]>(
      `${this.statsUrl}/overview?period=${period}`
    );
  }
}
