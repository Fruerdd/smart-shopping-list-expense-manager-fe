import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationDTO} from '@app/models/notification.dto';
import {UserProfileService} from '@app/services/user-profile.service';
import {interval, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ImageUrlService} from 'src/app/services/image-url.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @Input() currentUserId: string | null = null;
  @Input() isVisible: boolean = false;
  @Output() closeNotifications = new EventEmitter<void>();
  @Output() notificationCountChanged = new EventEmitter<number>();

  notifications: NotificationDTO[] = [];
  unreadCount: number = 0;
  loading = false;
  private pollingSubscription?: Subscription;

  constructor(
    private userProfileService: UserProfileService,
    private imageUrlService: ImageUrlService
  ) {
  }

  ngOnInit() {
    if (this.currentUserId) {
      this.loadNotifications();
      this.loadUnreadCount();
      this.startPolling();
    }
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private startPolling() {
    if (!this.currentUserId) return;

    // Poll for unread notification count every 30 seconds
    this.pollingSubscription = interval(30000)
      .pipe(
        switchMap(() => this.userProfileService.getUnreadNotificationCount(this.currentUserId!))
      )
      .subscribe({
        next: (count) => {
          const previousCount = this.unreadCount;
          this.unreadCount = count;
          this.notificationCountChanged.emit(count);

          // If count changed, reload notifications
          if (count !== previousCount) {
            this.loadNotifications();
          }
        },
        error: (error) => {
          console.error('Error polling notification count:', error);
        }
      });
  }

  loadNotifications() {
    if (!this.currentUserId) return;

    this.loading = true;
    this.userProfileService.getUserNotifications(this.currentUserId).subscribe({
      next: (notifications) => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        this.notifications = notifications.filter(notification => {
          const notificationDate = new Date(notification.createdAt);
          return notificationDate >= threeDaysAgo;
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.notifications = [];
        this.loading = false;
      }
    });
  }

  loadUnreadCount() {
    if (!this.currentUserId) return;

    this.userProfileService.getUnreadNotificationCount(this.currentUserId).subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.notificationCountChanged.emit(count);
      },
      error: (error) => console.error('Error loading unread count:', error)
    });
  }

  acceptFriendRequest(notification: NotificationDTO) {
    if (!this.currentUserId) return;

    this.userProfileService.acceptFriendRequest(this.currentUserId, notification.sourceUserId).subscribe({
      next: (response) => {
        console.log('Friend request accepted:', response);
        this.markAsRead(notification);
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (error) => {
        console.error('Error accepting friend request:', error);
        alert('Failed to accept friend request');
      }
    });
  }

  declineFriendRequest(notification: NotificationDTO) {
    if (!this.currentUserId) return;

    this.userProfileService.declineFriendRequest(this.currentUserId, notification.sourceUserId).subscribe({
      next: (response) => {
        console.log('Friend request declined:', response);
        this.markAsRead(notification);
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (error) => {
        console.error('Error declining friend request:', error);
        alert('Failed to decline friend request');
      }
    });
  }

  markAsRead(notification: NotificationDTO) {
    this.userProfileService.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.loadUnreadCount();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead() {
    if (!this.currentUserId) return;

    const nonFriendRequestNotifications = this.notifications.filter(
      n => !n.isRead && n.notificationType !== 'FRIEND_REQUEST'
    );

    if (nonFriendRequestNotifications.length === 0) {
      return;
    }

    this.userProfileService.markAllNotificationsAsRead(this.currentUserId).subscribe({
      next: () => {
        this.notifications.forEach(n => {
          if (n.notificationType !== 'FRIEND_REQUEST') {
            n.isRead = true;
          }
        });
        this.loadUnreadCount();
      },
      error: (error) => {
        console.error('Backend mark-all-as-read failed, using individual marking:', error);

        this.markNotificationsIndividually(nonFriendRequestNotifications);
      }
    });
  }

  private markNotificationsIndividually(notifications: NotificationDTO[]) {
    let completedCount = 0;
    const totalCount = notifications.length;

    notifications.forEach(notification => {
      this.userProfileService.markNotificationAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          completedCount++;

          if (completedCount === totalCount) {
            this.loadUnreadCount();
          }
        },
        error: (error) => {
          console.error(`Error marking notification ${notification.id} as read:`, error);
          completedCount++;

          if (completedCount === totalCount) {
            this.loadUnreadCount();
          }
        }
      });
    });
  }

  closePopup() {
    this.closeNotifications.emit();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'FRIEND_REQUEST':
        return 'fas fa-user-plus';
      case 'COLLABORATOR_ADDED':
        return 'fas fa-list';
      case 'REFERRAL_REWARD':
        return 'fas fa-gift';
      case 'SYSTEM_MESSAGE':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  }

  hasUnreadNonFriendRequestNotifications(): boolean {
    return this.notifications.some(n => !n.isRead && n.notificationType !== 'FRIEND_REQUEST');
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    return this.imageUrlService.getFullImageUrl(avatarPath);
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }
}
