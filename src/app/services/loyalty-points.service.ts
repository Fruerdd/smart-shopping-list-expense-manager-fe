import { Injectable } from '@angular/core';
import { UserProfileService } from './user-profile.service';
import { AuthService } from './auth.service';
import { Observable, of, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LoyaltyPointsService {

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService
  ) {}

  
  // Award points for creating a shopping list
  awardPointsForListCreation(count: number = 1): Observable<string> {
    return this.awardPoints('create_list', count);
  }

  // Award points for adding favorite products
  awardPointsForFavoriteProduct(count: number = 1): Observable<string> {
    return this.awardPoints('add_favorite_product', count);
  }

  // Award points for adding favorite stores
  awardPointsForFavoriteStore(count: number = 1): Observable<string> {
    return this.awardPoints('add_favorite_store', count);
  }

  // Generic method to award points for any activity
  private awardPoints(activity: string, count: number = 1): Observable<string> {
    const currentUserId = this.getCurrentUserId();
    
    if (!currentUserId) {
      console.warn('No current user found for points awarding');
      return of('No user logged in');
    }

    return this.userProfileService.awardLoyaltyPoints(currentUserId, activity, count).pipe(
      catchError(error => {
        console.error(`Error awarding points for ${activity}:`, error);
        return of('Points could not be awarded');
      })
    );
  }

  // Show a notification for points awarded
  showPointsNotification(message: string, showAlert: boolean = false): void {
    if (message.includes('Earned') || message.includes('Lucky')) {
      console.log('🎉 ' + message);
      if (showAlert) {
        alert('🎉 ' + message);
      }
    } else {
      console.log(message);
    }
  }

  // Award points with notification
  awardPointsWithNotification(activity: string, count: number = 1, showAlert: boolean = false): void {
    this.awardPoints(activity, count).subscribe({
      next: (message) => {
        this.showPointsNotification(message, showAlert);
      },
      error: (error) => {
        console.error('Failed to award points:', error);
      }
    });
  }

  private getCurrentUserId(): string | null {
    try {
      const token = this.authService.getToken();
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.id || tokenPayload.userId || tokenPayload.sub || null;
      }
      
      // Fallback to localStorage
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.id || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting user ID:', error);
      return null;
    }
  }
} 