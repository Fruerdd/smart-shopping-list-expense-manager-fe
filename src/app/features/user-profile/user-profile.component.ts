import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserProfileService} from '@app/services/user-profile.service';
import {ActivatedRoute, Router} from '@angular/router';
import {QRCodeComponent} from 'angularx-qrcode';
import {AuthService} from '@app/services/auth.service';
import {UserDTO} from '@app/models/user.dto';
import {ReviewDTO} from '@app/models/review.dto';
import {debounceTime, distinctUntilChanged, forkJoin, of, Subject, Subscription, switchMap} from 'rxjs';
import {MoneySpentChartComponent} from './money-spent-chart/money-spent-chart.component';
import {ExpensesByStoreChartComponent} from './expenses-by-store-chart/expenses-by-store-chart.component';
import {PriceAverageChartComponent} from './price-average-chart/price-average-chart.component';
import {AverageSavedChartComponent} from './average-saved-chart/average-saved-chart.component';
import {CategorySpendingChartComponent} from './category-spending-chart/category-spending-chart.component';
import {ImageUrlService} from '@app/services/image-url.service';
import {LoyaltyPointsService, PointsNotification} from '@app/services/loyalty-points.service';
import {PopupComponent} from '@app/features/user-profile/popup/popup.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QRCodeComponent,
    MoneySpentChartComponent,
    PriceAverageChartComponent,
    ExpensesByStoreChartComponent,
    AverageSavedChartComponent,
    CategorySpendingChartComponent,
    PopupComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: UserDTO | null = null;
  friends: UserDTO[] = [];
  userReview: ReviewDTO | null = null;
  loyaltyPoints: number = 0;
  currentUserId: string | null = null;
  loading = false;
  showFriendsModal = false;
  isEditingReview = false;
  editedReview: ReviewDTO | null = null;

  searchQuery: string = '';
  searchResults: UserDTO[] = [];
  isSearching = false;
  showSearchResults = false;
  private searchSubject = new Subject<string>();
  private routeSubscription: Subscription = new Subscription();

  isOwnProfile = false;
  isFriend = false;
  hasPendingFriendRequest = false;

  showPopup = false;
  popupTitle = '';
  popupMessage = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private authService: AuthService,
    private imageUrlService: ImageUrlService,
    private loyaltyPointsService: LoyaltyPointsService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) {
          return of([]);
        }
        this.isSearching = true;
        return this.userProfileService.searchUsers(query);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results.filter(user => user.id !== this.currentUserId);
        this.isSearching = false;
        this.showSearchResults = this.searchQuery.trim().length >= 2;
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
      }
    });

    this.loyaltyPointsService.pointsNotification$.subscribe(notification => {
      this.showPointsPopup(notification);
    });
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    return this.imageUrlService.getFullImageUrl(avatarPath);
  }

  getLoyaltyTier(points: number): string {
    if (points >= 1000) return 'GOLD';
    if (points >= 500) return 'SILVER';
    return 'BRONZE';
  }

  getTierColor(tier: string): string {
    switch (tier) {
      case 'GOLD':
        return '#FFD700';
      case 'SILVER':
        return '#C0C0C0';
      case 'BRONZE':
        return '#CD7F32';
      default:
        return '#CD7F32';
    }
  }

  onSearchInput(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  viewUserProfile(userId: string) {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.router.navigate(['/user-profile', userId]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  navigateToEditProfile(): void {
    if (this.user?.id) {
      this.router.navigate(['/user-profiles/edit', this.user.id]);
    }
  }

  toggleFriendship(): void {
    if (!this.currentUserId || !this.user?.id) {
      alert('Unable to process friend request. Please try again.');
      return;
    }

    if (this.isFriend) {
      this.userProfileService.removeFriend(this.currentUserId, this.user.id)
        .subscribe({
          next: () => {
            this.isFriend = false;
            this.hasPendingFriendRequest = false;
            this.loadUserData(this.user!.id);
          },
          error: () => {
            alert('Failed to remove friend. Please try again.');
          }
        });
    } else {
      this.userProfileService.sendFriendRequest(this.currentUserId, this.user.id)
        .subscribe({
          next: () => {
            this.hasPendingFriendRequest = true;
          },
          error: (error) => {
            if (error.message && error.message.includes('already exists')) {
              alert('Friend request already sent');
            } else {
              alert('Failed to send friend request. Please try again.');
            }
          }
        });
    }
  }

  copyCoupon(couponCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(couponCode).then(() => {
      }).catch(() => {
      });
    }
  }

  private showErrorPopup(title: string, message: string) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.showPopup = true;
  }

  onPopupClose() {
    this.showPopup = false;
  }

  saveReview(): void {
    if (!this.editedReview || !this.user?.id) {
      return;
    }

    this.userProfileService.updateUserReview(this.user.id, this.editedReview).subscribe({
      next: (updatedReview) => {
        this.userReview = updatedReview;
        this.isEditingReview = false;
        this.editedReview = null;
      },
      error: () => {
        this.showErrorPopup('Update Failed', 'Failed to update review. Please try again.');
      }
    });
  }

  submitReferral(referralCode: string): void {
    if (!referralCode.trim()) {
      return;
    }

    if (!this.user?.id) {
      this.showErrorPopup('Error', 'User not found');
      return;
    }

    const cleanedCode = referralCode.trim().toUpperCase();

    this.userProfileService.applyReferralCode(this.user.id, cleanedCode).subscribe({
      next: () => {
        this.loadUserData(this.user!.id);
      },
      error: (error) => {
        let errorMessage = error.message || 'Failed to apply referral code. Please try again.';

        if (errorMessage.includes('already used a referral code') ||
          errorMessage.includes('already been referred') ||
          errorMessage.includes('already have a referral')) {
          errorMessage = 'You have already been referred by another user. Each user can only be referred once.';
        }

        this.showErrorPopup('Referral Code Error', errorMessage);
      }
    });
  }

  showAllFriends(): void {
    this.showFriendsModal = true;
  }

  closeFriendsModal(): void {
    this.showFriendsModal = false;
  }

  startEditingReview(): void {
    if (this.userReview) {
      this.editedReview = {...this.userReview};
      this.isEditingReview = true;
    }
  }

  cancelEditingReview(): void {
    this.isEditingReview = false;
    this.editedReview = null;
  }

  updateReviewRating(rating: number): void {
    if (this.editedReview) {
      this.editedReview.reviewScore = rating;
    }
  }

  private loadUserData(userId: string): void {
    this.loading = true;

    this.isOwnProfile = this.currentUserId === userId;

    forkJoin({
      profile: this.userProfileService.getUserProfileById(userId),
      friends: this.userProfileService.getUserFriends(userId),
      loyaltyPoints: this.userProfileService.getLoyaltyPoints(userId),
      reviews: this.userProfileService.getUserReviews(userId)
    }).subscribe({
      next: (data) => {
        this.user = data.profile;
        this.friends = data.friends;
        this.loyaltyPoints = data.loyaltyPoints;
        this.userReview = data.reviews;

        if (!this.isOwnProfile && this.currentUserId) {
          this.isFriend = this.friends.some(friend => friend.id === this.currentUserId);
        } else {
          this.isFriend = false;
        }

        this.loading = false;
      },
      error: () => {
        this.userProfileService.getUserProfileById(userId).subscribe({
          next: (profile) => {
            this.user = profile;
            this.isOwnProfile = this.currentUserId === userId;
            this.isFriend = false;
            this.loading = false;
          },
          error: () => {
            alert('Failed to load user profile. Please try again later.');
            this.router.navigate(this.currentUserId ? ['/user-profile', this.currentUserId] : ['/user-profile']);
            this.loading = false;
          }
        });
      }
    });
  }

  private loadCurrentUserProfile(): void {
    this.loading = true;
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.currentUserId = data.id;

        const currentRoute = this.route.snapshot.params['id'];
        if (currentRoute !== data.id) {
          this.router.navigate(['/user-profile', this.currentUserId]);
        } else {
          this.loadUserData(data.id);
        }
      },
      error: () => {
        alert('Failed to load your profile. Please try again later.');
        this.router.navigate(['/login']);
        this.loading = false;
      },
    });
  }

  private loadCurrentUserProfileThenNavigate(targetUserId: string): void {
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.currentUserId = data.id;

        this.loadUserData(targetUserId);
      },
      error: () => {
        alert('Failed to load your profile. Please try again later.');
        this.router.navigate(['/login']);
        this.loading = false;
      },
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isLoggedIn()) {
        alert("You're not logged in!");
        this.router.navigate(['/login']);
        return;
      }

      this.extractUserIdFromToken();
      this.routeSubscription = this.route.params.subscribe(params => {
        const routeId = params['id'];

        if (!routeId || !this.isValidUUID(routeId)) {
          this.loadCurrentUserProfile();
          return;
        }

        if (!this.currentUserId) {
          this.loadCurrentUserProfileThenNavigate(routeId);
          return;
        }

        this.isOwnProfile = (this.currentUserId === routeId);

        this.loadUserData(routeId);
      });
    }
  }

  private extractUserIdFromToken(): void {
    try {
      const token = this.authService.getToken();
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        let possibleUserId = tokenPayload.id || tokenPayload.userId || tokenPayload.sub || null;

        if (!possibleUserId) {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            possibleUserId = user.id || null;
          }
        }

        if (possibleUserId && this.isValidUUID(possibleUserId)) {
          this.currentUserId = possibleUserId;
        } else if (possibleUserId) {
          this.currentUserId = null;
        } else {
          this.currentUserId = null;
        }
      }
    } catch (error) {
      this.currentUserId = null;
    }
  }

  private isValidUUID(str: string): boolean {
    return /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(str);
  }

  ngOnDestroy(): void { 
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private showPointsPopup(notification: PointsNotification) {
    this.popupTitle = notification.title;
    this.popupMessage = notification.message;
    this.showPopup = true;
  }
}
