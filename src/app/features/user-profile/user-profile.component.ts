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
    CategorySpendingChartComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const routeId = Number(this.route.snapshot.paramMap.get('id'));
      // const storedUser = localStorage.getItem('loggedInUser');
      //
      // if (!storedUser) {
      //   alert('Niste prijavljeni');
      //   this.router.navigate(['/login']);
      //   return;
      // }
      //
      // const loggedInUser = JSON.parse(storedUser);
      //
      // if (Number(loggedInUser.id) !== routeId) {
      //   alert('Nemate pristup ovom profilu!');
      //   this.router.navigate(['/user-profile', loggedInUser.id]);
      //   return;
      // }

      this.userProfileService.getUserProfile(routeId).subscribe((data) => {
        this.user = data;
      });
    }
  }
}
