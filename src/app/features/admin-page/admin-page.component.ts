import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewCardsComponent } from './overview-cards/overview-cards.component';
import { PopularShopsComponent } from './popular-shops/popular-shops.component';
import { TotalUserSavingsComponent } from './total-user-savings/total-user-savings.component';
import { AllCustomersComponent } from './all-customers/all-customers.component';
import { ProductAnalyticsComponent } from './product-analytics/product-analytics.component';
import { CityAllocationComponent } from './city-allocation/city-allocation.component';
import { RouterModule, NavigationEnd, Router } from '@angular/router'; 
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
  standalone: true,  
  imports: [
    OverviewCardsComponent,
    PopularShopsComponent,
    TotalUserSavingsComponent,
    AllCustomersComponent,
    ProductAnalyticsComponent,
    CityAllocationComponent,
    CommonModule,
    RouterModule
  ]
})
export class AdminPageComponent {
  childRouteActive = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const url = e.urlAfterRedirects;
        // now set true if we're on *either* child route
        this.childRouteActive =
          url.includes('/admin-page/add-users') ||
          url.includes('/admin-page/add-products');
      });
  }
}
