import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserProfileService } from '@app/services/user-profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Router } from '@angular/router';
import { MoneySpentChartComponent } from '@app/charts/money-spent-chart/money-spent-chart.component';
import { AveragePriceChartComponent } from '@app/charts/average-price-chart/average-price-chart.component';
import { ExpensesByStoreChartComponent } from '@app/charts/expenses-by-store-chart/expenses-by-store-chart.component';
import { AverageSavedChartComponent } from '@app/charts/average-saved-chart/average-saved-chart.component';
import { CategorySpendingChartComponent } from '@app/charts/category-spending-chart/category-spending-chart.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/services/auth.service';


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
export class UserProfileComponent implements OnInit {
  user: any;

  currentDate: string = ''; 
  searchQuery: string = '';
  searchResults: any[] = [];
  showAllFriends = false;
  showInfo = false;
  currentUserId: string | null = null;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private authService: AuthService
  ) {}

  toggleFriendsView(): void {
  this.showAllFriends = !this.showAllFriends;
}

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }

  navigateToEditProfile(): void {
    if (this.user?.id) {
      this.router.navigate(['/user-profiles/edit', this.user.id]);
    }
  }

  onSearchUser(): void {
  if (this.searchQuery.trim().length < 2) {
    this.searchResults = [];
    return;
  }

  this.userProfileService.getAllProfiles().subscribe(allUsers => {
    // Exclude self and already-friends
    const lowerQuery = this.searchQuery.toLowerCase();
    this.searchResults = allUsers.filter(u =>
      u.id !== this.user.id &&
      !this.user.friends.includes(u.name) &&
      (u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery))
    );
  });
}
//ovaj dio povezati sa backend-om da se novi prijatelji mogu dodavati u DB, a dodati funkciju i brisanja prijatelja
addFriend(newFriend: any): void {
  this.user.friends.push(newFriend.name);  

  this.userProfileService.updateUserProfile(this.user.id, this.user).subscribe(() => {
    this.searchQuery = '';
    this.searchResults = [];
  });
}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    // 1) Postavi današnji datum u formatu dd/MM/yyyy (hr-BA)
    const today = new Date();
    this.currentDate = today.toLocaleDateString('hr-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // 2) Provjeri je li korisnik ulogiran (localStorage + authService)
    const storedUser = localStorage.getItem('loggedInUser');
    if (!storedUser || !this.authService.isLoggedIn()) {
      alert("Niste prijavljeni!");
      this.router.navigate(['/login']);
      return;
    }

    // 3) Izvuci ID prijavljenog korisnika iz JWT tokena
    this.extractUserIdFromToken();

    // 4) Dobavi ID iz URL parametra
    const routeId = this.route.snapshot.paramMap.get('id');

    // 5) Validiraj routeId: ako ne postoji ili nije validan UUID, preusmjeri na svoj profil
    if (!routeId || routeId === 'null' || !this.isValidUUID(routeId)) {
      if (this.currentUserId) {
        this.router.navigate(['/user-profile', this.currentUserId]);
      } else {
        this.loadCurrentUserProfile();
      }
      return;
    }

    // 6) Ako pokušava pristupiti tuđem profilu, provjeri admin prava
    if (this.currentUserId && this.currentUserId !== routeId) {
      const isAdmin = this.checkIfUserIsAdmin();
      if (!isAdmin) {
        alert("Nemate pristup ovom profilu!");
        if (this.currentUserId) {
          this.router.navigate(['/user-profile', this.currentUserId]);
        } else {
          this.loadCurrentUserProfile();
        }
        return;
      }
    }

    // 7) Učitaj profil korisnika prema routeId
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
      this.router.navigate(
        this.currentUserId
          ? ['/user-profile', this.currentUserId]
          : ['/user-profile']
      );
    },
  });
}

private extractUserIdFromToken(): void {
  try {
    const token = this.authService.getToken();
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId =
        tokenPayload.id ||
        tokenPayload.userId ||
        tokenPayload.sub ||
        null;

      if (!this.currentUserId) {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          this.currentUserId = user.id || null;
        }
      }

      // Validate UUID format
      if (
        this.currentUserId &&
        !this.isValidUUID(this.currentUserId)
      ) {
        console.error(
          'Invalid UUID in token or localStorage:',
          this.currentUserId
        );
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
