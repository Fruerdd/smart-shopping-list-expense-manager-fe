import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Category, ShoppingListItem } from '@app/services/shopping-list-page.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, MatIconModule]
})
export class ProductListComponent {
  @Input() categories: Category[] = [];
  @Input() filteredProducts: ShoppingListItem[] = [];
  @Input() selectedProducts: ShoppingListItem[] = [];
  @Input() searchTerm = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() toggleCategoryEvent = new EventEmitter<Category>();
  @Output() selectProductEvent = new EventEmitter<ShoppingListItem>();
  @Output() comparePricesEvent = new EventEmitter<string>();

  onSearchInput(): void {
    this.searchChange.emit(this.searchTerm);
  }

  toggleCategory(category: Category): void {
    this.toggleCategoryEvent.emit(category);
  }

  selectProduct(product: ShoppingListItem): void {
    this.selectProductEvent.emit(product);
  }

  compareStoreItems(productId: string, event: Event): void {
    event.stopPropagation();
    this.comparePricesEvent.emit(productId);
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts.some(p => p.id === productId);
  }

  getProductQuantity(productId: string): number {
    const product = this.selectedProducts.find(p => p.id === productId);
    return product?.quantity || 0;
  }

  isCategoryExpanded(category: Category): boolean {
    return (category as any).expanded !== false;
  }
}
