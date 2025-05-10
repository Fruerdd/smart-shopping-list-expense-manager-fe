// src/app/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** 
 * Mirror your server‐side DTO exactly, PLUS an index signature 
 * so that `u[h]` in your CSV preview template compiles. 
 */
export interface UserDTO {
  [key: string]: any;

  id?:       string;
  name:          string;
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

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = 'http://localhost:8080/api/users';

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
}
