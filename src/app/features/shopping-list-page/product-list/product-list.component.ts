import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {CategoryDTO} from '@app/models/category.dto';
import {ShoppingListItemDTO} from '@app/models/shopping-list-item.dto';
import {Subject, debounceTime, takeUntil} from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  @Input() set categories(value: CategoryDTO[]) {
    this._categories = value;
    this.originalCategories = [...value];
    this.updateFilteredProducts();
  }
  get categories(): CategoryDTO[] {
    return this._categories;
  }
  private _categories: CategoryDTO[] = [];

  @Input() selectedProducts: ShoppingListItemDTO[] = [];
  @Input() preferredStore: string | null = null;

  @Output() selectProductEvent = new EventEmitter<ShoppingListItemDTO>();
  @Output() comparePricesEvent = new EventEmitter<string>();
  @Output() toggleCategoryEvent = new EventEmitter<CategoryDTO>();

  searchTerm = '';
  filteredProducts: ShoppingListItemDTO[] = [];
  private collapsedCategories = new Set<string>();
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private originalCategories: CategoryDTO[] = [];

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.updateFilteredProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private updateFilteredProducts(): void {
    if (!this.searchTerm) {
      this.filteredProducts = [];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    const uniqueProducts = new Map<string, ShoppingListItemDTO>();
    
    this.originalCategories
      .flatMap(category => category.products)
      .forEach(product => {
        if (product.productName.toLowerCase().includes(searchTermLower)) {
          if (!uniqueProducts.has(product.productId)) {
            uniqueProducts.set(product.productId, product);
          }
        }
      });

    this.filteredProducts = Array.from(uniqueProducts.values());
  }

  getDisplayCategories(): CategoryDTO[] {
    if (!this.searchTerm) {
      return this.categories;
    }

    const searchResultsCategory: CategoryDTO = {
      id: 'search-results',
      name: 'Search Results',
      products: this.filteredProducts.map(product => {
        const originalProduct = this.findOriginalProduct(product.productId);
        return originalProduct || product;
      })
    };

    return [searchResultsCategory];
  }

  private findOriginalProduct(productId: string): ShoppingListItemDTO | undefined {
    for (const category of this.originalCategories) {
      const found = category.products.find(p => p.productId === productId);
      if (found) {
        return found;
      }
    }
    return undefined;
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

  getDisplayStoreName(product: ShoppingListItemDTO): string {
    if (product.storeName) {
      return product.storeName;
    }
    return this.preferredStore || 'No store selected';
  }

  getDisplayPrice(product: ShoppingListItemDTO): string {
    if (product.price !== null && product.price !== undefined) {
      return `${product.price} KM`;
    }
    return 'Price not available';
  }

  getBestPriceInfo(product: ShoppingListItemDTO): {
    bestStore: string,
    bestPrice: string,
    selectedStorePrice?: string
  } | null {
    const bestPriceInfo = {
      bestStore: (product as any).originalBestStore || product.storeName || 'Unknown',
      bestPrice: (product as any).originalBestPrice ? `${(product as any).originalBestPrice} KM` : 'N/A',
      selectedStorePrice: undefined as string | undefined
    };

    if (this.preferredStore && this.preferredStore !== bestPriceInfo.bestStore) {
      bestPriceInfo.selectedStorePrice = this.getDisplayPrice(product);
    }

    return bestPriceInfo;
  }
}
