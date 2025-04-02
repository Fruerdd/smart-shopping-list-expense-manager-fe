import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Customer {
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AllCustomersService {
  getCustomers(): Observable<Customer[]> {
    return of([
      { name: 'Jane Cooper', phoneNumber: '555-123-4567', email: 'jane.cooper@example.com', city: 'Sarajevo', status: 'Active' },
      { name: 'Floyd Miles', phoneNumber: '555-987-6543', email: 'floyd.miles@example.com', city: 'Mostar', status: 'Inactive' },
      { name: 'Ronald Richards', phoneNumber: '555-111-2222', email: 'ronald.richards@example.com', city: 'Tuzla', status: 'Active' }
    ]);
  }
}
