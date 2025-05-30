import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDTO } from '@app/models/user.dto';
import { AuthService } from './auth.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';
import { ReviewDTO } from '@app/models/review.dto';
import { NotificationDTO } from '@app/models/notification.dto';

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

  uploadProfilePicture(userId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${this.apiUrl}/profile/upload-picture/${userId}`, formData, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  searchUsers(query: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Friend management methods
  sendFriendRequest(userId: string, friendId: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/friends/${userId}/request`, null, {
      params: { friendId },
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  acceptFriendRequest(userId: string, requesterId: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/friends/${userId}/accept`, null, {
      params: { requesterId },
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  declineFriendRequest(userId: string, requesterId: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/friends/${userId}/decline`, null, {
      params: { requesterId },
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  removeFriend(userId: string, friendId: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/friends/${userId}/remove`, {
      params: { friendId },
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Notification methods
  getUserNotifications(userId: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/notifications/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  getUnreadNotifications(userId: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/notifications/${userId}/unread`).pipe(
      catchError(this.handleError)
    );
  }

  getUnreadNotificationCount(userId: string): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/notifications/${userId}/count`).pipe(
      map((response: any) => {
        return typeof response === 'number' ? response : parseInt(response.toString());
      }),
      catchError(this.handleError)
    );
  }

  markNotificationAsRead(notificationId: string): Observable<string> {
    return this.http.patch<string>(`${this.apiUrl}/notifications/${notificationId}/read`, null, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  markAllNotificationsAsRead(userId: string): Observable<string> {
    return this.http.patch<string>(`${this.apiUrl}/notifications/${userId}/read-all`, null, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      let backendMessage = '';
      
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          backendMessage = parsedError.message || parsedError.error || '';
        } catch (e) {
          backendMessage = error.error;
        }
      } else if (error.error && typeof error.error === 'object') {
        backendMessage = error.error.message || error.error.error || '';
      }
      
      if (backendMessage && backendMessage.includes('"')) {
        const match = backendMessage.match(/"([^"]+)"/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          errorMessage = backendMessage;
        }
      } else if (backendMessage) {
        errorMessage = backendMessage;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Bad request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 409:
            errorMessage = 'Conflict. Resource already exists or has been used.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }
    }

    console.error('Error in UserProfileService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}