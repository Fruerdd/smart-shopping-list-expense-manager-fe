import {Component, Inject, OnInit, OnDestroy, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserProfileService} from '@app/services/user-profile.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MoneySpentChartComponent} from '@app/charts/money-spent-chart/money-spent-chart.component';
import {AveragePriceChartComponent} from '@app/charts/average-price-chart/average-price-chart.component';
import {ExpensesByStoreChartComponent} from '@app/charts/expenses-by-store-chart/expenses-by-store-chart.component';
import {AverageSavedChartComponent} from '@app/charts/average-saved-chart/average-saved-chart.component';
import {CategorySpendingChartComponent} from '@app/charts/category-spending-chart/category-spending-chart.component';
import {QRCodeComponent} from 'angularx-qrcode';
import {AuthService} from '@app/services/auth.service';
import { UserDTO } from '@app/models/user.dto';
import { ReviewDTO } from '@app/models/review.dto';
import { forkJoin, debounceTime, distinctUntilChanged, switchMap, of, Subscription } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QRCodeComponent,
    MoneySpentChartComponent,
    AveragePriceChartComponent,
    ExpensesByStoreChartComponent,
    AverageSavedChartComponent,
    CategorySpendingChartComponent,
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
  activeTab: string = 'profile';
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private authService: AuthService
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
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    
    if (avatarPath.startsWith('/uploads/')) {
      return `http://localhost:8080${avatarPath}`;
    }
    
    return avatarPath;
  }

  getLoyaltyTier(points: number): string {
    if (points >= 1000) return 'GOLD';
    if (points >= 500) return 'SILVER';
    return 'BRONZE';
  }

  // Get tier color for styling
  getTierColor(tier: string): string {
    switch (tier) {
      case 'GOLD': return '#FFD700';
      case 'SILVER': return '#C0C0C0';
      case 'BRONZE': return '#CD7F32';
      default: return '#CD7F32';
    }
  }

  // Search functionality
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
      this.userProfileService.removeFriend(this.currentUserId, this.user.id).subscribe({
        next: (response) => {
          console.log('Friend removed:', response);
          this.isFriend = false;
          this.hasPendingFriendRequest = false;
          this.loadUserData(this.user!.id);
        },
        error: (error) => {
          console.error('Error removing friend:', error);
          alert('Failed to remove friend. Please try again.');
        }
      });
    } else {
      this.userProfileService.sendFriendRequest(this.currentUserId, this.user.id).subscribe({
        next: (response) => {
          console.log('Friend request sent:', response);
          this.hasPendingFriendRequest = true;
        },
        error: (error) => {
          console.error('Error sending friend request:', error);
          if (error.message && error.message.includes('already exists')) {
            alert('Friend request already sent or you are already friends.');
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
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  submitReferral(referralCode: string): void {
    if (!referralCode.trim()) {
      return;
    }
    
    if (!this.user?.id) {
      alert('User not found');
      return;
    }

    const cleanedCode = referralCode.trim().toUpperCase();

    this.userProfileService.applyReferralCode(this.user.id, cleanedCode).subscribe({
      next: (response) => {
        this.loadUserData(this.user!.id);
      },
      error: (error) => {
        console.error('Error applying referral code:', error);
        
        let errorMessage = error.message || 'Failed to apply referral code. Please try again.';
        
        if (errorMessage.includes('already used a referral code') || 
            errorMessage.includes('already been referred') ||
            errorMessage.includes('already have a referral')) {
          errorMessage = 'You have already been referred by another user. Each user can only be referred once.';
        }
        
        alert(errorMessage);
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
      this.editedReview = { ...this.userReview };
      this.isEditingReview = true;
    }
  }

  cancelEditingReview(): void {
    this.isEditingReview = false;
    this.editedReview = null;
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
      error: (error) => {
        console.error('Error updating review:', error);
        alert('Failed to update review. Please try again.');
      }
    });
  }

  updateReviewRating(rating: number): void {
    if (this.editedReview) {
      this.editedReview.reviewScore = rating;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
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
      error: (error) => {
        console.error('Error loading user data:', error);
        this.userProfileService.getUserProfileById(userId).subscribe({
          next: (profile) => {
            this.user = profile;
            this.isOwnProfile = this.currentUserId === userId;
            this.isFriend = false;
            this.loading = false;
          },
          error: (profileError) => {
            console.error('Error loading user profile:', profileError);
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
      error: (error) => {
        console.error('Error fetching current user profile:', error);
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
      error: (error) => {
        console.error('Error fetching current user profile:', error);
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
      console.error('Error extracting user ID from token:', error);
      this.currentUserId = null;
    }
  }

  private checkIfUserIsAdmin(): boolean {
    try {
      const token = this.authService.getToken();
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.userType === 'ADMIN' || tokenPayload.role === 'ADMIN';
      }
      return false;
    } catch {
      return false;
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
}