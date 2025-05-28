import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDTO } from '@app/models/user.dto';
import { AuthService } from './auth.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

// private apiUrl = `${environment.apiUrl}/user`;
  private apiUrl = 'http://localhost:8080/userProfiles';
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  getCurrentUserProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/profile/me`).pipe(
      catchError((error) => {
        if (error.status === 403) {
          this.authService.logout();
        }
        return this.handleError(error);
      })
    );
  }

  getUserProfileById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/profile/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getUsersByIds(userIds: string[]): Observable<UserDTO[]> {
    return this.http.post<UserDTO[]>(`${environment.apiUrl}/api/users/bulk`, { userIds }).pipe(
      catchError(this.handleError)
    );
  }

  getUserStatistics(userId: string): Observable<UserStatisticsDTO> {
    return this.http.get<UserStatisticsDTO>(`${this.apiUrl}/statistics/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateUserProfile(userId: string, userData: Partial<UserDTO>): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${this.apiUrl}/profile/${userId}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  getUserFriends(userId: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/friends/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'Profile not found.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }

    console.error('Error in UserProfileService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
