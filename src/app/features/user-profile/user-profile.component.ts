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
  user: any;
  currentUserId: string | null = null;

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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is logged in
      if (!this.authService.isLoggedIn()) {
        alert("You're not logged in!");
        this.router.navigate(['/login']);
        return;
      }

      // Get current user ID from token
      this.extractUserIdFromToken();

      // Get user ID from route parameter
      const routeId = this.route.snapshot.paramMap.get('id');

      // Validate routeId
      if (routeId === 'null' || !routeId || !this.isValidUUID(routeId)) {
        if (this.currentUserId) {
          this.router.navigate(['/user-profile', this.currentUserId]);
          return;
        } else {
          this.loadCurrentUserProfile();
          return;
        }
      }

      // Check if the user is trying to access their own profile or is an admin
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

      // If no currentUserId, try loading the current user's profile first
      if (!this.currentUserId) {
        this.loadCurrentUserProfile();
        return;
      }

      // Fetch the user profile by ID
      this.loadUserProfile(routeId);
    }
  }

  private loadCurrentUserProfile(): void {
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.currentUserId = data.id; // Update current user ID
        // Redirect to the user's own profile
        this.router.navigate(['/user-profile', this.currentUserId]);
      },
      error: (error) => {
        console.error('Error fetching current user profile:', error);
        alert('Failed to load your profile. Please try again later.');
        this.router.navigate(['/login']);
      },
    });
  }

  private loadUserProfile(userId: string): void {
    this.userProfileService.getUserProfileById(userId).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        alert('Failed to load user profile. Please try again later.');
        this.router.navigate(this.currentUserId ? ['/user-profile', this.currentUserId] : ['/user-profile']);
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

        // Validate UUID format
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
