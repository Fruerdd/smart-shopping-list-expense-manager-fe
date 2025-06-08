import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';


export interface SavingsDataItem {
  month: string;
  savings: number;
}

@Injectable({
  providedIn: 'root'
})
export class SavingsService {
  getSavingsData(): Observable<SavingsDataItem[]> {
    return of([
      {month: 'Jan', savings: 300},
      {month: 'Feb', savings: 450},
      {month: 'Mar', savings: 500},
      {month: 'Apr', savings: 600},
      {month: 'May', savings: 700},
      {month: 'Jun', savings: 650},
      {month: 'Jul', savings: 800},
      {month: 'Aug', savings: 900},
      {month: 'Sep', savings: 850},
      {month: 'Oct', savings: 950},
      {month: 'Nov', savings: 1000},
      {month: 'Dec', savings: 1100},
    ]);
  }
}
