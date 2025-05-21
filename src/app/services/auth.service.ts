import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  userType: 'USER' | 'ADMIN';
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/user';
  private storageKey = 'token';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.storageKey, response.token);
          // Fetch user profile to get UUID
          this.http.get(`${this.apiUrl}/profile/me`).subscribe((user: any) => {
            localStorage.setItem('userInfo', JSON.stringify({ id: user.id, email: user.email }));
          });
        }
      })
    );
  }

  register(registerData: RegisterDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData, {
      responseType: 'text'
    });
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
