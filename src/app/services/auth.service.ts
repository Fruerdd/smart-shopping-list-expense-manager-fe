import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  token: string;
  userType: 'USER' | 'ADMIN';
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/user';
  private storageKey = 'token';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.getStorage()?.setItem(this.storageKey, response.token);
          // Fetch user profile to get UUID
          this.http.get(`${this.apiUrl}/profile/me`).subscribe((user: any) => {
            this.getStorage()?.setItem('userInfo', JSON.stringify({ id: user.id, email: user.email }));
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
    this.getStorage()?.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.storageKey) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUserId(): string | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }
    const userInfo = storage.getItem('userInfo');
    const userId = userInfo ? JSON.parse(userInfo).id : null;
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    return userId;
  }

  setCurrentUserId(userId: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem('currentUserId', userId);
    }
  }

  clearCurrentUserId(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem('currentUserId');
    }
  }
}
