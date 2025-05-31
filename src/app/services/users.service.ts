// src/app/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


/** 
 * Mirror your server‐side DTO exactly, PLUS an index signature 
 * so that `u[h]` in your CSV preview template compiles. 
 */
export interface UserDTO {
  [key: string]: any;

  id?:       string;
  name:          string;
  avatar?:       string;
  email:         string;
  password?:     string;
  phoneNumber?:  string;
  referralCode?: string;
  promoCode?:    string;
  bonusPoints?:  number;
  deviceInfo?:   string;
  location?:     string;
  userType: 'USER' | 'ADMIN'; 
  isActive:      boolean;
  reviewScore?:  number;
  reviewContext?:string;
}

export interface TestimonialDTO {
  name:             string;
  reviewScore:      number;
  reviewContext:    string;
  avatar?:          string | null;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private baseMain = environment.apiUrl;

  private readonly base = `${this.baseMain}/api/users`;
  private readonly base1 = `${this.baseMain}/api/customers`;



  constructor(private http: HttpClient) {}

  /** GET all users */
  getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.base);
  }

  /** POST to bulk-add new users */
  bulkAddUsers(users: UserDTO[]): Observable<UserDTO[]> {
    return this.http.post<UserDTO[]>(`${this.base}/bulk`, users);
  }

  /** PUT to bulk-update existing users */
  bulkUpdateUsers(users: UserDTO[]): Observable<UserDTO[]> {
    return this.http.put<UserDTO[]>(`${this.base}/bulk`, users);
  }

  getTestimonials(): Observable<TestimonialDTO[]> {
    return this.http.get<TestimonialDTO[]>(`${this.base1}/reviews`);
  }
}
