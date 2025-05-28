import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
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
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
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
export class UserProfileComponent implements OnInit {
  user: UserDTO | null = null;
  friends: UserDTO[] = [];
  userReview: ReviewDTO | null = null;
  loyaltyPoints: number = 0;
  currentUserId: string | null = null;
  activeTab: string = 'profile';
  loading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private authService: AuthService
  ) {}

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }

  navigateToEditProfile(): void {
    if (this.user?.id) {
      this.router.navigate(['/user-profiles/edit', this.user.id]);
    }
  }

  copyCoupon(couponCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(couponCode).then(() => {
        console.log('Coupon code copied to clipboard');
        alert('Coupon code copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  submitCoupon(couponCode: string): void {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }
    console.log('Submitting coupon:', couponCode);
    alert('Coupon submission functionality coming soon!');
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  private loadUserData(userId: string): void {
    this.loading = true;
    
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.userProfileService.getUserProfileById(userId).subscribe({
          next: (profile) => {
            this.user = profile;
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isLoggedIn()) {
        alert("You're not logged in!");
        this.router.navigate(['/login']);
        return;
      }

      this.extractUserIdFromToken();

      const routeId = this.route.snapshot.paramMap.get('id');

      if (routeId === 'null' || !routeId || !this.isValidUUID(routeId)) {
        if (this.currentUserId) {
          this.router.navigate(['/user-profile', this.currentUserId]);
          return;
        } else {
          this.loadCurrentUserProfile();
          return;
        }
      }

      if (this.currentUserId && this.currentUserId !== routeId) {
        const isAdmin = this.checkIfUserIsAdmin();
        if (!isAdmin) {
          alert("You don't have access to this profile!");
          if (this.currentUserId) {
            this.router.navigate(['/user-profile', this.currentUserId]);
          } else {
            this.loadCurrentUserProfile();
          }
          return;
        }
      }

      if (!this.currentUserId) {
        this.loadCurrentUserProfile();
        return;
      }

      this.loadUserData(routeId);
    }
  }

  private loadCurrentUserProfile(): void {
    this.loading = true;
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.currentUserId = data.id;
        this.loadUserData(data.id);
        this.router.navigate(['/user-profile', this.currentUserId]);
      },
      error: (error) => {
        console.error('Error fetching current user profile:', error);
        alert('Failed to load your profile. Please try again later.');
        this.router.navigate(['/login']);
        this.loading = false;
      },
    });
  }

  private extractUserIdFromToken(): void {
    try {
      const token = this.authService.getToken();
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = tokenPayload.id || tokenPayload.userId || tokenPayload.sub || null;

        if (!this.currentUserId) {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            this.currentUserId = user.id || null;
          }
        }

        if (this.currentUserId && !this.isValidUUID(this.currentUserId)) {
          console.error('Invalid UUID in token or localStorage:', this.currentUserId);
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}