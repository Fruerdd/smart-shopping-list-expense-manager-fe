import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteProductsService } from '@app/services/favorite-products.service';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ProductDTO } from '@app/models/product.dto';
import { FavoriteProductDTO } from '@app/models/favorite-product.dto';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatIcon],
  templateUrl: './favorite-products.component.html',
  styleUrls: ['./favorite-products.component.css']
})
export class FavoriteProductsComponent implements OnInit {
  favoriteProducts$!: Observable<FavoriteProductDTO[]>;
  searchResults$!: Observable<ProductDTO[]>;
  showAddForm = false;
  searchQuery = '';
  userId: string;
  private searchTerms = new Subject<string>();

  constructor(private favoriteProductsService: FavoriteProductsService) {
    const userInfo = localStorage.getItem('userInfo');
    this.userId = userInfo ? JSON.parse(userInfo).id : '';
    if (!this.userId) {
      throw new Error('User ID not found. Please log in again.');
    }
  }

  ngOnInit(): void {
    this.loadFavoriteProducts();
    this.searchResults$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.favoriteProductsService.searchProducts(this.userId, term))
    );
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  loadFavoriteProducts(): void {
    this.favoriteProducts$ = this.favoriteProductsService.getFavoriteProducts(this.userId);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.searchQuery = '';
    if (!this.showAddForm) {
      this.searchTerms.next('');
    }
  }

  addProduct(product: ProductDTO): void {
    this.favoriteProductsService.addFavoriteProduct(this.userId, product.id)
      .subscribe(() => {
        this.loadFavoriteProducts();
        this.toggleAddForm();
      });
  }

  removeProduct(productId: string): void {
    this.favoriteProductsService.removeFavoriteProduct(this.userId, productId)
      .subscribe({
        next: () => {
          this.loadFavoriteProducts();
        },
        error: (error) => {
          // If the product was not found, consider it a success case
          if (error.status === 404 || error.message?.toLowerCase().includes('not found')) {
            this.loadFavoriteProducts(); // Refresh list as the item is already gone
            return;
          }
          // Only show error for actual errors (network, server, etc)
          console.error('Failed to remove product:', error);
          // Here you could add a user-friendly error notification
        }
      });
  }
}
