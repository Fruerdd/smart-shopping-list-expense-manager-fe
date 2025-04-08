import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {
  Category,
  ShoppingList,
  ShoppingListItem,
  ShoppingListPageService, SidebarCategory,
  StoreItem
} from '@app/services/shopping-list-page.service';
import {filter, finalize, switchMap, tap} from 'rxjs/operators';
import {forkJoin, map, Observable, of} from 'rxjs';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {SidebarComponent} from '@app/features/shopping-list-page/sidebar/sidebar.component';
import {ListFormComponent} from '@app/features/shopping-list-page/list-form/list-form.component';
import {SelectedProductsComponent} from '@app/features/shopping-list-page/selected-products/selected-products.component';
import {ProductListComponent} from '@app/features/shopping-list-page/product-list/product-list.component';
import {PriceComparisonModalComponent} from '@app/features/shopping-list-page/price-comparison-modal/price-comparison-modal.component';
import {StoreSelectionModalComponent} from '@app/features/shopping-list-page/store-selection-modal/store-selection-modal.component';

@Component({
  selector: 'app-shopping-list-page',
  templateUrl: './shopping-list-page.component.html',
  styleUrls: ['./shopping-list-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIcon,
    MatIconModule,
    SidebarComponent,
    ListFormComponent,
    SelectedProductsComponent,
    ProductListComponent,
    PriceComparisonModalComponent,
    StoreSelectionModalComponent
  ]
})
export class ShoppingListPageComponent implements OnInit {
  categories: Category[] = [];
  selectedProducts: ShoppingListItem[] = [];
  isEditMode: boolean = false;
  listId: string | null = null;
  searchTerm: string = '';
  filteredProducts: ShoppingListItem[] = [];
  isLoading: boolean = false;
  currentList: ShoppingList | null = null;
  originalCategories: Category[] = [];
  selectedCategoryId: string | null = null;
  preferredStore: string | null = null;
  showStoreSelectionModal: boolean = false;
  availableStores: { storeName: string; storeIcon: string; }[] = [];
  sidebarCategories: SidebarCategory[] = [];

  showComparisonModal: boolean = false;
  storeComparisons: StoreItem[] = [];
  selectedComparisonProduct: ShoppingListItem | null = null;
  isLoadingComparisons: boolean = false;
  @ViewChild(ListFormComponent) listFormComponent!: ListFormComponent;
  private formValues: any;
  protected initialFormValues: { shareWith: string[]; name: string; description: string; type: string; } | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shoppingListService: ShoppingListPageService,
  ) {}

  ngOnInit(): void {
    this.isLoading = false; // Should be set to true when fetching data, but for now it remains false,
                            // something needs to be modified for it to not load forever

    this.route.paramMap.pipe(
      tap(params => {
        this.listId = params.get('id');
        this.isEditMode = !!this.listId;
      }),
      switchMap(() => {
        return this.shoppingListService.getSidebarCategories().pipe(
          tap(categories => {
            this.sidebarCategories = categories;
          }),
          switchMap(() => this.shoppingListService.getCategories())
        );
      }),
      tap(categories => {
        this.categories = categories;
        this.originalCategories = JSON.parse(JSON.stringify(categories));
        this.getAllProducts();
      }),
      switchMap(() => {
        if (this.isEditMode && this.listId) {
          return this.shoppingListService.getListById(this.listId);
        }
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(list => {
      if (list) {
        this.currentList = list;
        this.loadListData(list);
      }
    });
  }

  loadListData(list: ShoppingList): void {
    this.initialFormValues = {
      name: list.name,
      description: list.description,
      type: list.type,
      shareWith: list.shareWith ? [list.shareWith] : []
    };

    this.selectedProducts = [...list.items];
  }

  onFormValuesChange(values: any): void {
    this.formValues = values;
  }

  getAllProducts(): void {
    this.shoppingListService.getAllProducts().subscribe(products => {
      this.filteredProducts = products;
      this.categories = JSON.parse(JSON.stringify(this.originalCategories));
    });
  }

  searchProducts(term?: string): void {
    const searchTerm = term || this.searchTerm;

    if (!searchTerm.trim()) {
      this.getAllProducts();
      this.updateCategoriesWithSearchResults([]);
      return;
    }

    this.isLoading = true;
    this.shoppingListService.searchProducts(searchTerm).subscribe(products => {
      this.filteredProducts = products;
      this.updateCategoriesWithSearchResults(products);
      this.isLoading = false;
    });
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategoryId = categoryId;
    this.isLoading = true;
    this.searchTerm = '';

    if (this.selectedCategoryId === 'default') {
      this.shoppingListService.getAllProducts().subscribe(products => {
        this.filteredProducts = products;
        this.categories = this.originalCategories;
        this.isLoading = false;
      });
    } else {

      this.shoppingListService.getProductsByCategory(categoryId).subscribe(products => {
        this.filteredProducts = products;

        this.categories = this.originalCategories.filter(cat => cat.id === categoryId);
        if (this.categories.length > 0) {
          (this.categories[0] as any).expanded = true;
        }

        this.isLoading = false;
      });
    }
  }

  updateCategoriesWithSearchResults(searchResults: ShoppingListItem[]): void {
    if (!searchResults || searchResults.length === 0) {
      this.resetCategoriesToOriginal();
      return;
    }
    this.categories.forEach(category => {
      category.products = [];
      (category as any).expanded = false;
    });

    searchResults.forEach(product => {
      const categoryId = (product as any).category || 'general';
      const category = this.categories.find(c => c.id === categoryId);

      if (category) {
        category.products.push(product);
        (category as any).expanded = true;
      } else {
        let generalCategory = this.categories.find(c => c.id === 'general');
        if (!generalCategory) {
          generalCategory = {
            id: 'general',
            name: 'Search Results',
            products: []
          };
          this.categories.push(generalCategory);
        }
        generalCategory.products.push(product);
        (generalCategory as any).expanded = true;
      }
    });
  }

  resetCategoriesToOriginal(): void {
    this.categories = JSON.parse(JSON.stringify(this.originalCategories));
  }

  toggleCategory(category: Category): void {
    (category as any).expanded = !(category as any).expanded;
  }

  selectProduct(product: ShoppingListItem): void {
    const index = this.selectedProducts.findIndex(p => p.id === product.id);

    if (index === -1) {
      this.isLoading = true;

      this.shoppingListService.getItemPriceComparisons(product.id).subscribe(storeItems => {
        let selectedStoreItem: StoreItem | undefined;

        if (this.preferredStore) {
          selectedStoreItem = storeItems.find(item => item.storeName === this.preferredStore);
        }

        if (!selectedStoreItem && storeItems.length > 0) {
          selectedStoreItem = storeItems[0];
          if (!this.preferredStore) {
            this.preferredStore = selectedStoreItem.storeName;
            this.applyPreferredStoreToList();
          }
        }

        if (selectedStoreItem) {
          this.selectedProducts.push({
            ...product,
            storeName: selectedStoreItem.storeName,
            price: selectedStoreItem.price,
            quantity: 1
          });
        } else {
          this.selectedProducts.push({
            ...product,
            quantity: 1
          });
        }
        this.isLoading = false;
      });
    } else {
      this.selectedProducts.splice(index, 1);
    }
  }


  updateItemQuantity(event: {id: string, quantity: number}): void {
    const item = this.selectedProducts.find(p => p.id === event.id);
    if (item) {
      item.quantity = event.quantity;
    }
  }

  changePreferredStore(): void {
    this.showStoreSelectionModal = true;
    this.isLoadingComparisons = true;

    // Get a list of all available stores
    this.shoppingListService.getAllAvailableStores().subscribe(stores => {
      this.availableStores = stores;
      this.isLoadingComparisons = false;
    });
  }

  selectPreferredStore(storeName: string): void {
    this.preferredStore = storeName;
    this.showStoreSelectionModal = false;

    this.applyPreferredStoreToList();
  }

  closeStoreSelectionModal(): void {
    this.showStoreSelectionModal = false;
  }

  saveList(): void {
    if (!this.listFormComponent.isFormValid()) {
      return;
    }

    this.isLoading = true;
    const formData = this.listFormComponent.getFormValues();

    let saveObservable: Observable<ShoppingList | null>;

    if (this.isEditMode && this.listId) {
      saveObservable = this.shoppingListService.updateList(this.listId, {
        ...formData,
        items: this.selectedProducts
      });
    } else {
      saveObservable = this.shoppingListService.createList({
        ...formData,
        items: this.selectedProducts,
        userId: 'user123'
      });
    }

    saveObservable.pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(result => {
      if (result) {
        this.router.navigate(['/dashboard/shopping-lists']);
      } else {
        console.error('Failed to save shopping list');
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/dashboard/shopping-lists']);
  }

  compareStoreItems(productId: string): void {
    this.isLoadingComparisons = true;
    this.showComparisonModal = true;

    this.selectedComparisonProduct = this.findProductById(productId);

    this.shoppingListService.getItemPriceComparisons(productId).subscribe(storeItems => {
      this.storeComparisons = storeItems;
      this.isLoadingComparisons = false;
    });
  }

  findProductById(productId: string): ShoppingListItem | null {
    for (const category of this.categories) {
      const product = category.products.find(p => p.id === productId);
      if (product) {
        return product;
      }
    }
    return null;
  }

  closeComparisonModal(): void {
    this.showComparisonModal = false;
    this.selectedComparisonProduct = null;
    this.storeComparisons = [];
  }

  selectStore(store: StoreItem): void {
    this.preferredStore = store.storeName;

    if (this.selectedComparisonProduct) {
      const updatedProduct: ShoppingListItem = {
        ...this.selectedComparisonProduct,
        storeName: store.storeName,
        price: store.price,
        quantity: 1
      };

      const index = this.selectedProducts.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        this.selectedProducts[index] = {
          ...this.selectedProducts[index],
          storeName: store.storeName,
          price: store.price
        };
      }
      else {
        this.selectedProducts.push(updatedProduct);
      }

      this.applyPreferredStoreToList();
      this.closeComparisonModal();
    }
  }

  applyPreferredStoreToList(): void {
    if (!this.preferredStore) return;

    this.isLoading = true;

    const productUpdates$ = this.selectedProducts.map(product =>
      this.shoppingListService.getItemPriceComparisons(product.id).pipe(
        map(storeItems => {
          const preferredStoreItem = storeItems.find(item => item.storeName === this.preferredStore);
          if (preferredStoreItem) {
            return {
              productId: product.id,
              storeName: preferredStoreItem.storeName,
              price: preferredStoreItem.price
            };
          }
          return null;
        }),
        filter(update => update !== null)
      )
    );

    forkJoin(productUpdates$)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(updates => {
        updates.forEach(update => {
          if (!update) return;

          const index = this.selectedProducts.findIndex(p => p.id === update.productId);
          if (index !== -1) {
            this.selectedProducts[index] = {
              ...this.selectedProducts[index],
              storeName: update.storeName,
              price: update.price
            };
          }
        });
      });
  }

  removeProduct(product: ShoppingListItem): void {
    this.selectProduct(product);
  }
}
