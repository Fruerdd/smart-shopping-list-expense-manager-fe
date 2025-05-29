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

  // Search functionality
  searchQuery: string = '';
  searchResults: UserDTO[] = [];
  isSearching = false;
  showSearchResults = false;
  private searchSubject = new Subject<string>();
  private routeSubscription: Subscription = new Subscription();

  // Profile viewing logic
  isOwnProfile = false;
  isFriend = false; // This will be determined when we implement friend relationships

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private authService: AuthService
  ) {
    // Setup search with debounce
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
    
    // If it's already a full URL or base64, return as is
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    
    // If it's a relative path, prepend the API base URL
    if (avatarPath.startsWith('/uploads/')) {
      return `http://localhost:8080${avatarPath}`;
    }
    
    return avatarPath;
  }

  // Get loyalty tier based on points
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
    // Clear search state
    this.showSearchResults = false;
    this.searchQuery = '';
    
    // Navigate to the user profile
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

  // This method will be implemented later for friend functionality
  toggleFriendship(): void {
    // TODO: Implement add/remove friend functionality
  }

  copyCoupon(couponCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(couponCode).then(() => {
        alert('Coupon code copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  submitReferral(referralCode: string): void {
    if (!referralCode.trim()) {
      alert('Please enter a referral code');
      return;
    }
    
    if (!this.user?.id) {
      alert('User not found');
      return;
    }

    this.userProfileService.applyReferralCode(this.user.id, referralCode).subscribe({
      next: (response) => {
        alert(response);
        // Reload user data to get updated points
        this.loadUserData(this.user!.id);
      },
      error: (error) => {
        console.error('Error applying referral code:', error);
        alert('Failed to apply referral code. Please try again.');
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
        alert('Review updated successfully!');
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
    
    // Determine if this is the user's own profile
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
        
        // Check if current user is friends with this user
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
            this.isFriend = false; // Can't determine friendship without friends data
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
        this.currentUserId = data.id; // Set the actual UUID from the API response
        
        // Only navigate if we're not already on the correct route
        const currentRoute = this.route.snapshot.params['id'];
        if (currentRoute !== data.id) {
          this.router.navigate(['/user-profile', this.currentUserId]);
        } else {
          // We're already on the correct route, load the full user data
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
        this.currentUserId = data.id; // Set the actual UUID from the API response
        
        // Now load the target user's data
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

      // Subscribe to route parameter changes
      this.routeSubscription = this.route.params.subscribe(params => {
        const routeId = params['id'];

        // If no route ID or invalid UUID, load current user profile
        if (!routeId || !this.isValidUUID(routeId)) {
          this.loadCurrentUserProfile();
          return;
        }

        // If we don't have currentUserId yet (email-based token case)
        if (!this.currentUserId) {
          this.loadCurrentUserProfileThenNavigate(routeId);
          return;
        }

        // Set isOwnProfile based on comparison
        this.isOwnProfile = (this.currentUserId === routeId);

        // Load data for the requested user
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

        // If we didn't find it in token, check localStorage
        if (!possibleUserId) {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            possibleUserId = user.id || null;
          }
        }

        // Check if we have a valid UUID
        if (possibleUserId && this.isValidUUID(possibleUserId)) {
          this.currentUserId = possibleUserId;
        } else if (possibleUserId) {
          // If it's not a UUID (probably an email), we'll need to get the actual user ID
          // by calling the current user profile endpoint
          this.currentUserId = null; // Set to null, loadCurrentUserProfile will handle it
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
    // accept any dashed 36-char id so the app works even if backend does not issue RFC-4122 UUIDs
    return /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(str);
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}