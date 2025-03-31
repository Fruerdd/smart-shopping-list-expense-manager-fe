import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewCardsComponent } from './overview-cards/overview-cards.component';
import { PopularShopsComponent } from './popular-shops/popular-shops.component';
import { TotalUserSavingsComponent } from './total-user-savings/total-user-savings.component';
import { AllCustomersComponent } from './all-customers/all-customers.component';
import { ProductAnalyticsComponent } from './product-analytics/product-analytics.component';


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
    CommonModule
  ]
})
export class AdminPageComponent {}
