import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDTO } from '@app/models/user.dto';
import { AuthService } from './auth.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';
import { ReviewDTO } from '@app/models/review.dto';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUserProfile(userId: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/profile/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

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

  getLoyaltyPoints(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/profile/loyalty-points/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateLoyaltyPoints(userId: string, points: number): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/profile/loyalty-points/${userId}`, null, {
      params: { points: points.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getUserReviews(userId: string): Observable<ReviewDTO> {
    return this.http.get<ReviewDTO>(`${this.apiUrl}/profile/reviews/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateUserReview(userId: string, review: ReviewDTO): Observable<ReviewDTO> {
    return this.http.post<ReviewDTO>(`${this.apiUrl}/profile/reviews/${userId}`, review).pipe(
      catchError(this.handleError)
    );
  }

  applyReferralCode(userId: string, referralCode: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/profile/referral/${userId}`, null, {
      params: { referralCode },
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  getUserReferralCode(userId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/profile/referral-code/${userId}`, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  awardLoyaltyPoints(userId: string, activity: string, count: number = 1): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/profile/award-points/${userId}`, null, {
      params: { 
        activity: activity,
        count: count.toString()
      },
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Convert file to compressed base64 for database storage
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create canvas to resize image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set tiny thumbnail size (max 50x50 pixels for tiny base64)
        const maxSize = 50;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image very aggressively
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.3); // 30% quality
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Load original image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Upload file to server (using the proper backend endpoint)
  uploadProfilePicture(userId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Backend expects 'file' parameter
    
    return this.http.post<string>(`${this.apiUrl}/profile/upload-picture/${userId}`, formData, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Search for users by name or email
  searchUsers(query: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
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