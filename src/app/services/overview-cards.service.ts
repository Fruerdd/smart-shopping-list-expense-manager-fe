import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface OverviewDataItem {
  title: string;
  value: number;
  change: string;
  date: string; 
}

function computeChange(current: number, previous: number): string {
  const diff = current - previous;
  const percent = Math.round((diff / previous) * 100);
  return percent >= 0 ? `+${percent}%` : `${percent}%`;
}

@Injectable({
  providedIn: 'root'
})
export class OverviewCardsService {
  getOverviewData(period: 'today' | 'lastWeek'): Observable<OverviewDataItem[]> {
    if (period === 'today') {
      const today = '2024-10-10';
      return of([
        { title: 'Views', value: 8000, change: computeChange(8000, 7600), date: today },
        { title: 'Visits', value: 4000, change: computeChange(4000, 4100), date: today },
        { title: 'New Users', value: 200, change: computeChange(200, 180), date: today },
        { title: 'Active Users', value: 2500, change: computeChange(2500, 2450), date: today }
      ]);
    } else {
      const weekDate = '2024-10-03';
      return of([
        { title: 'Views', value: 7200, change: computeChange(7200, 7000), date: weekDate },
        { title: 'Visits', value: 3600, change: computeChange(3600, 3500), date: weekDate },
        { title: 'New Users', value: 156, change: computeChange(156, 150), date: weekDate },
        { title: 'Active Users', value: 2318, change: computeChange(2318, 2300), date: weekDate }
      ]);
    }
  }
}
