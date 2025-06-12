import {Injectable} from '@angular/core';
import {UserProfileService} from './user-profile.service';
import {AuthService} from './auth.service';
import {Observable, of, Subject} from 'rxjs';
import {catchError} from 'rxjs/operators';

export interface PointsNotification {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoyaltyPointsService {
  private pointsNotificationSubject = new Subject<PointsNotification>();
  pointsNotification$ = this.pointsNotificationSubject.asObservable();

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService
  ) {
  }

  private awardPoints(activity: string, count: number = 1): Observable<string> {
    const currentUserId = this.getCurrentUserId();

    if (!currentUserId) {
      return of('No user logged in');
    }

    return this.userProfileService.awardLoyaltyPoints(currentUserId, activity, count).pipe(
      catchError(() => {
        return of('Points could not be awarded');
      })
    );
  }

  private showPointsNotification(message: string, showAlert: boolean = false): void {
    if (message.includes('Earned') || message.includes('Lucky')) {
      if (showAlert) {
        this.pointsNotificationSubject.next({
          title: 'Points Update',
          message: message
        });
      }
    }
  }

  awardPointsWithNotification(activity: string, count: number = 1, showAlert: boolean = false): void {
    this.awardPoints(activity, count).subscribe({
      next: (message) => {
        this.showPointsNotification(message, showAlert);
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

      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.id || null;
      }

      return null;
    } catch {
      return null;
    }
  }
}
