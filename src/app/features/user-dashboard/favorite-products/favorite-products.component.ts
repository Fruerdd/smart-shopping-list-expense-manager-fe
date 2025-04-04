import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FavoriteProductsService, FavoriteProduct, ProductSearchResult} from '@app/services/favorite-products.service';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorite-products.component.html',
  styleUrls: ['./favorite-products.component.css']
})
export class FavoriteProductsComponent implements OnInit {
  favoriteProducts$!: Observable<FavoriteProduct[]>;
  searchResults$!: Observable<FavoriteProduct[]>; // Add this to store search results
  newProductName = '';
  showAddForm = false;
  searchQuery = '';
  private searchTerms = new Subject<string>();

  constructor(private favoriteProductsService: FavoriteProductsService) {}

  ngOnInit(): void {
    this.loadFavoriteProducts();
    this.searchResults$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.favoriteProductsService.searchProducts(term))
    );
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  loadFavoriteProducts(): void {
    this.favoriteProducts$ = this.favoriteProductsService.getFavoriteProducts();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.newProductName = '';
  }

  addProduct(product: ProductSearchResult): void {
    if (!this.newProductName.trim()) return;

    this.favoriteProductsService.addFavoriteProduct({
      id: product.id,
      name: product.name,
      icon: '🛒' // Default icon
    }).subscribe(() => {
      this.loadFavoriteProducts();
      this.toggleAddForm();
    });
  }

  removeProduct(id: number): void {
    this.favoriteProductsService.removeFavoriteProduct(id)
      .subscribe(() => this.loadFavoriteProducts());
  }
}
