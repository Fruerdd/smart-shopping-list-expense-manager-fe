import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  // Update this to match your backend API URL and port
  private apiUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number | string): Observable<any> {
    // Make sure we're using the correct endpoint
    return this.http.get(`${this.apiUrl}/profile/${userId}`).pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  // Get the current user's profile (using the token)
  getCurrentUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/me`).pipe(
      catchError(error => {
        console.error('Error fetching current user profile:', error);
        return throwError(() => error);
      })
    );
  }

  getUserProfileById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${id}`);
  }

  updateUserProfile(userId: number | string, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/${userId}`, profileData).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        return throwError(() => error);
      })
    );
  }
}
