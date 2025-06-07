import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';

export interface AuthResponse {
  token: string;
  userType: 'USER' | 'ADMIN';
}

export interface AuthDTO {
  email: string;
  password: string;
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
  
  private apiUrl = environment.apiUrl + '/auth';
  private userApiUrl = environment.apiUrl + '/user';
  private storageKey = 'token';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  login(credentials: AuthDTO): Observable<AuthResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { headers }).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          this.getStorage()?.setItem(this.storageKey, response.token);
          this.http.get(`${this.userApiUrl}/profile/me`).subscribe((user: any) => {
            this.getStorage()?.setItem('userInfo', JSON.stringify({ id: user.id, email: user.email }));
          });
        }
      })
    );
  }

  register(registerData: RegisterDTO): Observable<string> {
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

  private getUserTypeFromToken(): 'USER' | 'ADMIN' | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userType as 'USER' | 'ADMIN' | null;
    } catch {
      return null;
    }
  }

  isAdminUser(): boolean {
    return this.getUserTypeFromToken() === 'ADMIN';
  }
}
