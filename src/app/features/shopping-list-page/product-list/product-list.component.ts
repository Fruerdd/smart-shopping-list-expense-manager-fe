import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoryDTO } from '@app/models/category.dto';
import { ShoppingListItemDTO } from '@app/models/shopping-list-item.dto';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  @Input() filteredProducts: ShoppingListItemDTO[] = [];
  @Input() selectedProducts: ShoppingListItemDTO[] = [];
  @Input() categories: CategoryDTO[] = [];
  @Input() searchTerm = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() toggleCategoryEvent = new EventEmitter<CategoryDTO>();
  @Output() selectProductEvent = new EventEmitter<ShoppingListItemDTO>();
  @Output() comparePricesEvent = new EventEmitter<string>();

  private collapsedCategories = new Set<string>();

  onSearchInput(): void {
    this.searchChange.emit(this.searchTerm);
  }

  toggleCategory(category: CategoryDTO): void {
    if (this.collapsedCategories.has(category.id)) {
      this.collapsedCategories.delete(category.id);
    } else {
      this.collapsedCategories.add(category.id);
    }
    this.toggleCategoryEvent.emit(category);
  }

  selectProduct(product: ShoppingListItemDTO): void {
    this.selectProductEvent.emit(product);
  }

  compareStoreItems(productId: string, event: Event): void {
    event.stopPropagation();
    this.comparePricesEvent.emit(productId);
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts.some(p => p.productId === productId);
  }

  getProductQuantity(productId: string): number {
    const product = this.selectedProducts.find(p => p.productId === productId);
    return product?.quantity || 0;
  }

  isCategoryExpanded(category: CategoryDTO): boolean {
    return !this.collapsedCategories.has(category.id);
  }
}
