import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ShoppingListManagementComponent} from '@app/features/user-dashboard/shopping-list-management/shopping-list-management.component';
import {FavoriteProductsComponent} from '@app/features/user-dashboard/favorite-products/favorite-products.component';
import {FavoriteStoresComponent} from '@app/features/user-dashboard/favorite-stores/favorite-stores.component';
import {PriceComparisonComponent} from '@app/features/user-dashboard/price-comparison/price-comparison.component';
import {Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ShoppingListManagementComponent,
    FavoriteProductsComponent,
    FavoriteStoresComponent,
    PriceComparisonComponent,
    RouterOutlet
  ]
})
export class UserDashboardComponent {
  constructor(protected router: Router) {}

  navigateToShoppingList(): void {
    this.router.navigate(['/dashboard/shopping-list']);
  }

}
