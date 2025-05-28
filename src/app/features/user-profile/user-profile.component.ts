import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '@app/services/user-profile.service';
import { ActivatedRoute } from '@angular/router';
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
    CategorySpendingChartComponent
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router
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
      const today = new Date();
      this.currentDate = today.toLocaleDateString('hr-BA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const routeId = Number(this.route.snapshot.paramMap.get('id'));
      const storedUser = localStorage.getItem('loggedInUser');

      if (!storedUser) {
        alert("You're not logged in!");
        this.router.navigate(['/login']);
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      if (Number(loggedInUser.id) !== routeId) {
        alert("You don't have access to this profile!");
        this.router.navigate(['/user-profile', loggedInUser.id]);
        return;
      }

      this.userProfileService.getUserProfile(routeId).subscribe((data) => {
        this.user = data;
      });
    }
  }
}
