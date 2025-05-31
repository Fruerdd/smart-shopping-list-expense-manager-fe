import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


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
  private base = environment;
  private readonly apiUrl = `${this.base}/api/customers`;

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }
}
