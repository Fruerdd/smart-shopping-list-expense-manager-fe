import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ShoppingListPageService} from '@app/services/shopping-list-page.service';
import {filter, finalize, switchMap, tap, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {forkJoin, map, Observable, of, Subject} from 'rxjs';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {SidebarComponent} from '@app/features/shopping-list-page/sidebar/sidebar.component';
import {ListFormComponent, ListFormValues} from '@app/features/shopping-list-page/list-form/list-form.component';
import {SelectedProductsComponent} from '@app/features/shopping-list-page/selected-products/selected-products.component';
import {ProductListComponent} from '@app/features/shopping-list-page/product-list/product-list.component';
import {PriceComparisonModalComponent} from '@app/features/shopping-list-page/price-comparison-modal/price-comparison-modal.component';
import {StoreSelectionModalComponent} from '@app/features/shopping-list-page/store-selection-modal/store-selection-modal.component';
import {CategoryDTO} from '@app/models/category.dto';
import {ShoppingListDTO, ListTypeEnum} from '@app/models/shopping-list.dto';
import {ShoppingListItemDTO} from '@app/models/shopping-list-item.dto';
import {StoreItemDTO} from '@app/models/store-item.dto';
import {StoreDTO} from '@app/models/store.dto';
import {PermissionEnum} from '@app/models/collaborator.dto';

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
export class ShoppingListPageComponent implements OnInit, OnDestroy {
  categories: CategoryDTO[] = [];
  selectedProducts: ShoppingListItemDTO[] = [];
  isEditMode: boolean = false;
  listId: string | null = null;
  searchTerm: string = '';
  filteredProducts: ShoppingListItemDTO[] = [];
  isLoading: boolean = false;
  currentList: ShoppingListDTO | null = null;
  originalCategories: CategoryDTO[] = [];
  selectedCategoryId: string | null = null;
  preferredStore: string | null = null;
  showStoreSelectionModal: boolean = false;
  availableStores: StoreDTO[] = [];
  sidebarCategories: CategoryDTO[] = [];

  showComparisonModal: boolean = false;
  storeComparisons: StoreItemDTO[] = [];
  selectedComparisonProduct: ShoppingListItemDTO | null = null;
  isLoadingComparisons: boolean = false;
  @ViewChild(ListFormComponent) listFormComponent!: ListFormComponent;
  private formValues: ListFormValues | null = null;
  protected initialFormValues: ListFormValues = {
    name: '',
    description: '',
    listType: ListTypeEnum.OTHER,
    shareWith: []
  };
  private userId: string;
  private searchSubject = new Subject<string>();
  private readonly DEBOUNCE_TIME = 300; // milliseconds
  private currentStore: StoreDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shoppingListService: ShoppingListPageService,
  ) {
    const userInfo = localStorage.getItem('userInfo');
    this.userId = userInfo ? JSON.parse(userInfo).id : '';
    if (!this.userId) {
      throw new Error('User ID not found. Please log in again.');
    }
  }

  ngOnInit(): void {
    this.setupSearch();
    this.isLoading = false;

    this.route.paramMap.pipe(
      tap(params => {
        this.listId = params.get('id');
        this.isEditMode = !!this.listId && this.hasEditPermission();
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

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(this.DEBOUNCE_TIME),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  searchProducts(term?: string): void {
    const searchTerm = term || this.searchTerm;
    this.searchSubject.next(searchTerm);
  }

  private performSearch(searchTerm: string): void {
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

  loadListData(list: ShoppingListDTO): void {
    this.currentList = list;
    this.initialFormValues = {
      name: list.name,
      description: list.description || '',
      listType: list.listType || ListTypeEnum.OTHER,
      shareWith: list.collaborators ? list.collaborators.map(c => c.userId) : []
    };

    if (this.listFormComponent) {
      this.listFormComponent.reset();
    }

    this.selectedProducts = [...list.items];
    this.preferredStore = list.storeName ?? null;
    if (list.storeId && list.storeName) {
      this.currentStore = {
        id: list.storeId,
        name: list.storeName,
        icon: '' // You might want to load the actual icon from somewhere
      };
    }

    // Update filtered products with selected products' info
    this.filteredProducts = this.filteredProducts.map(p => {
      const selectedProduct = list.items.find(sp => sp.productId === p.productId);
      if (selectedProduct) {
        return {
          ...p,
          storeName: selectedProduct.storeName,
          storeId: selectedProduct.storeId,
          price: selectedProduct.price
        };
      }
      return p;
    });

    // If we have a store, update prices for all products
    if (this.preferredStore) {
      this.updateProductPricesForStore(this.preferredStore);
    }
  }

  onFormValuesChange(values: ListFormValues): void {    this.formValues = values;  }

  getAllProducts(): void {
    this.shoppingListService.getAllProducts().subscribe({
      next: (products) => {
        // Update filtered products with selected products' info
        this.filteredProducts = products.map(p => {
          const selectedProduct = this.selectedProducts.find(sp => sp.id === p.id);
          if (selectedProduct) {
            return {
              ...p,
              storeName: selectedProduct.storeName,
              price: selectedProduct.price
            };
          }
          return p;
        });
        this.categories = JSON.parse(JSON.stringify(this.originalCategories));
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
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

  updateCategoriesWithSearchResults(searchResults: ShoppingListItemDTO[]): void {
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

  toggleCategory(category: CategoryDTO): void {
    (category as any).expanded = !(category as any).expanded;
  }

  onStoreSelected(store: StoreDTO): void {
    if (this.preferredStore === store.name) {
      return; // Don't do anything if the same store is selected
    }
    this.currentStore = store;
    this.preferredStore = store.name;
    this.showStoreSelectionModal = false;

    // Update all selected products with the new store
    this.selectedProducts = this.selectedProducts.map(product => ({
      ...product,
      storeName: store.name,
      storeId: store.id
    }));

    this.updateProductPricesForStore(store.name);
  }

  selectProduct(product: ShoppingListItemDTO): void {
    const index = this.selectedProducts.findIndex(p => p.productId === product.productId);

    if (index === -1) {
      // Product is not selected, add it
      this.shoppingListService.getItemPriceComparisons(product.productId).subscribe({
        next: (prices) => {
          // Find store with lowest price
          const lowestPriceStore = prices.reduce((lowest, current) => {
            if (!lowest || (current.price && (!lowest.price || current.price < lowest.price))) {
              return current;
            }
            return lowest;
          }, null as StoreItemDTO | null);

          if (lowestPriceStore) {
            // Set the current store if not already set
            if (!this.currentStore) {
              this.currentStore = {
                id: lowestPriceStore.storeId,
                name: lowestPriceStore.storeName,
                icon: lowestPriceStore.storeIcon || ''
              };
              this.preferredStore = lowestPriceStore.storeName;
            }

            // Add product with current store's price info
            const storePrice = prices.find(p => p.storeName === this.currentStore!.name);
            this.selectedProducts = [
              ...this.selectedProducts,
              {
                ...product,
                storeName: this.currentStore.name,
                storeId: this.currentStore.id,
                price: storePrice?.price || lowestPriceStore.price,
                quantity: 1
              }
            ];
          } else {
            // If no price info available, just add the product
            this.selectedProducts = [
              ...this.selectedProducts,
              { ...product, quantity: 1 }
            ];
          }
        }
      });
    } else {
      // Product is already selected, remove it
      this.selectedProducts = this.selectedProducts.filter(p => p.productId !== product.productId);
    }
  }

  updateItemQuantity(event: {id: string, quantity: number}): void {
    const index = this.selectedProducts.findIndex(p => p.id === event.id);
    if (index !== -1 && event.quantity > 0) {
      this.selectedProducts = [
        ...this.selectedProducts.slice(0, index),
        { ...this.selectedProducts[index], quantity: event.quantity },
        ...this.selectedProducts.slice(index + 1)
      ];
    }
  }

  changePreferredStore(): void {
    this.showStoreSelectionModal = true;
    this.isLoadingComparisons = true;

    this.shoppingListService.getAllAvailableStores().subscribe(stores => {
      this.availableStores = stores;
      this.isLoadingComparisons = false;
    });
  }

  closeStoreSelectionModal(): void {
    this.showStoreSelectionModal = false;
  }

  saveList(): void {
    if (!this.listFormComponent.isFormValid()) {
      return;
    }

    // Validate store selection
    if (!this.currentStore?.id) {
      console.error('Please select a store before saving the list');
      return;
    }

    this.isLoading = true;
    const formData = this.listFormComponent.getFormValues();

    const listData: Partial<ShoppingListDTO> = {
      name: formData.name,
      description: formData.description,
      listType: formData.listType,
      ownerId: this.userId,
      items: this.selectedProducts.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        storeName: this.currentStore!.name,
        storeId: this.currentStore!.id
      })),
      collaborators: formData.shareWith.map((userId: string) => ({
        userId,
        permission: PermissionEnum.EDIT
      })),
      active: true,
      storeId: this.currentStore.id,
      storeName: this.currentStore.name
    };

    let saveObservable: Observable<ShoppingListDTO>;

    if (this.isEditMode && this.listId && this.currentList) {
      // For updates, maintain the existing list ID and merge with current list data
      saveObservable = this.shoppingListService.updateList(this.listId, {
        id: this.listId,
        name: formData.name,
        description: formData.description,
        listType: formData.listType,
        ownerId: this.userId,
        items: listData.items,
        collaborators: formData.shareWith.map(userId => ({
          userId,
          permission: PermissionEnum.EDIT
        })),
        active: true,
        storeId: this.currentStore.id,
        storeName: this.currentStore.name
      });
    } else {
      // For new lists
      saveObservable = this.shoppingListService.createList(listData);
    }

    saveObservable.pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
        if (result) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Failed to save shopping list:', error);
        // TODO: Show error message to user
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/dashboard']);
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

  findProductById(productId: string): ShoppingListItemDTO | null {
    // First check in selected products
    const selectedProduct = this.selectedProducts.find(p => p.productId === productId);
    if (selectedProduct) {
      return selectedProduct;
    }

    // Then check in filtered products
    return this.filteredProducts.find(p => p.productId === productId) || null;
  }

  closeComparisonModal(): void {
    this.showComparisonModal = false;
    this.selectedComparisonProduct = null;
    this.storeComparisons = [];
    this.isLoadingComparisons = false;
  }

  selectStore(store: StoreItemDTO): void {
    const previousStore = this.preferredStore;
    this.preferredStore = store.storeName;
    this.currentStore = {
      id: store.storeId,
      name: store.storeName,
      icon: store.storeIcon
    };
    
    // If we have a selected comparison product, add it to selected products
    if (this.selectedComparisonProduct) {
      const isAlreadySelected = this.selectedProducts.some(p => p.productId === this.selectedComparisonProduct!.productId);
      if (!isAlreadySelected) {
        this.selectedProducts = [
          ...this.selectedProducts,
          {
            ...this.selectedComparisonProduct,
            storeName: store.storeName,
            storeId: store.storeId,
            price: store.price,
            quantity: 1
          }
        ];
      }
    }

    // Update all selected products with the new store
    this.selectedProducts = this.selectedProducts.map(product => ({
      ...product,
      storeName: store.storeName,
      storeId: store.storeId
    }));

    this.closeComparisonModal();
    this.updateProductPricesForStore(store.storeName);
  }

  applyPreferredStoreToList(): void {
    if (!this.preferredStore) return;
    this.updateProductPricesForStore(this.preferredStore);
  }

  removeProduct(product: ShoppingListItemDTO): void {
    this.selectedProducts = this.selectedProducts.filter(p => p.productId !== product.productId);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchInput(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  showPriceComparison(productId: string): void {
    if (this.isLoadingComparisons) {
      return; // Prevent multiple simultaneous requests
    }

    this.isLoadingComparisons = true;
    const product = this.findProductById(productId);
    
    if (product) {
      this.selectedComparisonProduct = product;
      this.shoppingListService.getItemPriceComparisons(product.productId).subscribe({
        next: (comparisons) => {
          this.storeComparisons = comparisons;
          this.showComparisonModal = true;
          this.isLoadingComparisons = false;
        },
        error: (error) => {
          console.error('Error loading price comparisons:', error);
          this.isLoadingComparisons = false;
        }
      });
    } else {
      this.isLoadingComparisons = false;
    }
  }

  private updateProductPricesForStore(storeName: string): void {
    if (!storeName || this.selectedProducts.length === 0 || !this.currentStore) return;

    if (this.isLoading) {
      return; // Prevent multiple simultaneous updates
    }

    this.isLoading = true;
    const productUpdates = this.selectedProducts.map(product =>
      this.shoppingListService.getItemPriceComparisons(product.productId).pipe(
        map(prices => {
          const storePrice = prices.find(p => p.storeName === storeName);
          return {
            ...product,
            storeName: storeName,
            storeId: this.currentStore?.id,
            price: storePrice?.price,
            quantity: product.quantity || 1
          };
        })
      )
    );

    forkJoin(productUpdates).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (updatedProducts) => {
        this.selectedProducts = [...updatedProducts];
        // Force update of filtered products to reflect new store
        this.filteredProducts = this.filteredProducts.map(p => {
          const updatedProduct = updatedProducts.find(up => up.productId === p.productId);
          if (updatedProduct) {
            return {
              ...p,
              storeName: updatedProduct.storeName,
              storeId: updatedProduct.storeId,
              price: updatedProduct.price
            };
          }
          return p;
        });
      },
      error: (error) => {
        console.error('Error updating product prices:', error);
      }
    });
  }

  onUpdateProductStore(event: {productId: string, newStore: string}): void {
    this.updateProductPricesForStore(event.newStore);
  }

  hasEditPermission(): boolean {
    if (!this.currentList) {
      return false;
    }

    // Owner always has edit permission
    if (this.currentList.ownerId === this.userId) {
      return true;
    }

    // Check collaborator permissions
    const userCollaborator = this.currentList.collaborators.find(c => c.userId === this.userId);
    return userCollaborator?.permission === PermissionEnum.EDIT;
  }
}
