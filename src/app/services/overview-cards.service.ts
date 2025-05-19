// overview-cards.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OverviewDataItem {
  title:  string;
  value:  number;
  change: string;
}

@Injectable({ providedIn: 'root' })
export class OverviewCardsService {
  private readonly statsUrl = 'http://localhost:8080/api/stats';

  constructor(private http: HttpClient) {}

  getOverviewData(period: 'today' | 'lastWeek'): Observable<OverviewDataItem[]> {
    return this.http.get<OverviewDataItem[]>(
      `${this.statsUrl}/overview?period=${period}`
    );
  }
}
