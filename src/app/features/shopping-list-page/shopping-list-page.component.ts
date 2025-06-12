import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ShoppingListPageService} from '@app/services/shopping-list-page.service';
import {FavoriteProductsService} from '@app/services/favorite-products.service';
import {LoyaltyPointsService} from '@app/services/loyalty-points.service';
import {ProductService} from '@app/services/product.service';
import {PriceComparisonService} from '@app/services/price-comparison.service';
import {debounceTime, distinctUntilChanged, finalize, switchMap, tap} from 'rxjs/operators';
import {forkJoin, map, Observable, of, Subject} from 'rxjs';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {SidebarComponent} from '@app/features/shopping-list-page/sidebar/sidebar.component';
import {ListFormComponent, ListFormValues} from '@app/features/shopping-list-page/list-form/list-form.component';
import {
  SelectedProductsComponent
} from '@app/features/shopping-list-page/selected-products/selected-products.component';
import {ProductListComponent} from '@app/features/shopping-list-page/product-list/product-list.component';
import {
  PriceComparisonModalComponent
} from '@app/features/shopping-list-page/price-comparison-modal/price-comparison-modal.component';
import {
  StoreSelectionModalComponent
} from '@app/features/shopping-list-page/store-selection-modal/store-selection-modal.component';
import {CategoryDTO} from '@app/models/category.dto';
import {ListTypeEnum, ShoppingListDTO} from '@app/models/shopping-list.dto';
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
  protected initialFormValues: ListFormValues = {
    name: '',
    description: '',
    listType: ListTypeEnum.OTHER,
    shareWith: []
  };
  private readonly userId: string;
  private searchSubject = new Subject<string>();
  private readonly DEBOUNCE_TIME = 300; // milliseconds
  private currentStore: StoreDTO | null = null;
  favoriteProducts: ShoppingListItemDTO[] = [];
  showScrollToTop: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shoppingListService: ShoppingListPageService,
    private favoriteProductsService: FavoriteProductsService,
    private loyaltyPointsService: LoyaltyPointsService,
    private productService: ProductService,
    private priceComparisonService: PriceComparisonService
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
      }),
      switchMap(() => {
        return this.favoriteProductsService.getFavoriteProducts(this.userId).pipe(
          tap(favorites => {
            this.favoriteProducts = favorites.map(fav => ({
              ...fav,
              isChecked: false,
              quantity: 1,
              price: 0,
              storeId: '',
              storeName: ''
            }));
          }),
          switchMap(() => this.shoppingListService.getAllProducts()),
          tap(products => {
            this.filteredProducts = products;
          }),
          switchMap(() => this.shoppingListService.getSidebarCategories())
        );
      }),
      tap(categories => {
        const favoritesSidebarCategory = {
          id: 'favorite',
          name: 'Favorites',
          icon: 'favorite',
          products: []
        };
        this.sidebarCategories = [favoritesSidebarCategory, ...categories];
      }),
      switchMap(() => this.shoppingListService.getCategories()),
      tap(categories => {
        const specialCategories = [];
        const existingCategoryIds = categories.map(cat => cat.id);

        const favoriteProducts = this.getFavoriteProducts();
        if (favoriteProducts.length > 0 && !existingCategoryIds.includes('favorite')) {
          specialCategories.push({
            id: 'favorite',
            name: 'Favorites',
            icon: 'favorite',
            products: favoriteProducts
          });
        }

        if (!existingCategoryIds.includes('peoples-choice')) {
          specialCategories.push({
            id: 'peoples-choice',
            name: 'People\'s Choice',
            icon: 'group',
            products: []
          });
        }

        if (!existingCategoryIds.includes('best-price')) {
          specialCategories.push({
            id: 'best-price',
            name: 'Best Price',
            icon: 'attach_money',
            products: []
          });
        }

        this.categories = [...specialCategories, ...categories];
        this.originalCategories = JSON.parse(JSON.stringify(this.categories));

        this.loadSpecialCategories();
      }),
      switchMap(() => {
        if (this.listId) {
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
        this.isEditMode = this.hasEditPermission();
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
        icon: ''
      };
    }

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

    if (this.preferredStore) {
      this.updateProductPricesForStore(this.preferredStore);
    }
  }

  onFormValuesChange(): void {
  }

  getAllProducts(): void {
    this.shoppingListService.getAllProducts().subscribe({
      next: (products) => {
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
    } else if (this.selectedCategoryId === 'favorite') {
      this.shoppingListService.getAllProducts().subscribe(products => {
        this.filteredProducts = products;
        const favoriteProducts = this.getFavoriteProducts();
        this.categories = [{
          id: 'favorite',
          name: 'Favorites',
          icon: 'favorite',
          products: favoriteProducts
        }];
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
      if (category.id === 'favorite') {
        category.products = this.getFavoriteProducts().filter(product =>
          searchResults.some(sr => sr.productId === product.productId)
        );
      } else {
        category.products = [];
      }
      (category as any).expanded = false;
    });

    searchResults.forEach(product => {
      const categoryId = (product as any).category || 'general';
      const category = this.categories.find(c => c.id === categoryId);

      if (category && category.id !== 'favorite') {
        category.products.push(product);
        (category as any).expanded = true;
      } else if (!category) {
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
      return;
    }
    this.currentStore = store;
    this.preferredStore = store.name;
    this.showStoreSelectionModal = false;

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
      this.shoppingListService.getItemPriceComparisons(product.productId).subscribe({
        next: (prices) => {
          const lowestPriceStore = prices.reduce((lowest, current) => {
            if (!lowest || (current.price && (!lowest.price || current.price < lowest.price))) {
              return current;
            }
            return lowest;
          }, null as StoreItemDTO | null);

          if (lowestPriceStore) {
            if (!this.currentStore) {
              this.currentStore = {
                id: lowestPriceStore.storeId,
                name: lowestPriceStore.storeName,
                icon: lowestPriceStore.storeIcon || ''
              };
              this.preferredStore = lowestPriceStore.storeName;
            }

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
            this.selectedProducts = [
              ...this.selectedProducts,
              {...product, quantity: 1}
            ];
          }
        }
      });
    } else {
      this.selectedProducts = this.selectedProducts.filter(p => p.productId !== product.productId);
    }
  }

  updateItemQuantity(event: { id: string, quantity: number }): void {
    const index = this.selectedProducts.findIndex(p => p.id === event.id);
    if (index !== -1 && event.quantity > 0) {
      this.selectedProducts = [
        ...this.selectedProducts.slice(0, index),
        {...this.selectedProducts[index], quantity: event.quantity},
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

    if (!this.currentStore?.id) {
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
          this.loyaltyPointsService.awardPointsWithNotification('create_list', 1, true);
        }
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/dashboard']);
  }

  findProductById(productId: string): ShoppingListItemDTO | null {
    const selectedProduct = this.selectedProducts.find(p => p.productId === productId);
    if (selectedProduct) {
      return selectedProduct;
    }

    return this.filteredProducts.find(p => p.productId === productId) || null;
  }

  closeComparisonModal(): void {
    this.showComparisonModal = false;
    this.selectedComparisonProduct = null;
    this.storeComparisons = [];
    this.isLoadingComparisons = false;
  }

  selectStore(store: StoreItemDTO): void {
    this.preferredStore = store.storeName;
    this.currentStore = {
      id: store.storeId,
      name: store.storeName,
      icon: store.storeIcon
    };

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

    this.selectedProducts = this.selectedProducts.map(product => ({
      ...product,
      storeName: store.storeName,
      storeId: store.storeId
    }));

    this.closeComparisonModal();
    this.updateProductPricesForStore(store.storeName);
  }

  removeProduct(product: ShoppingListItemDTO): void {
    this.selectedProducts = this.selectedProducts.filter(p => p.productId !== product.productId);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollToTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchInput(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  showPriceComparison(productId: string): void {
    if (this.isLoadingComparisons) {
      return;
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
    if (!storeName || !this.currentStore) return;

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const selectedProductUpdates = this.selectedProducts.length > 0 ?
      this.selectedProducts.map(product =>
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
      ) : [];

    const categoryProductUpdates: Observable<any>[] = [];
    this.categories.forEach(category => {
      if (category.products && category.products.length > 0) {
        category.products.forEach(product => {
          if (product.productId) {
            categoryProductUpdates.push(
              this.shoppingListService.getItemPriceComparisons(product.productId).pipe(
                map(prices => {
                  const storePrice = prices.find(p => p.storeName === storeName);
                  return {
                    ...product,
                    storeName: storePrice ? storeName : product.storeName,
                    storeId: storePrice ? this.currentStore?.id : product.storeId,
                    price: storePrice?.price || product.price,
                    categoryId: category.id
                  };
                })
              )
            );
          }
        });
      }
    });

    const allUpdates = [...selectedProductUpdates, ...categoryProductUpdates];

    if (allUpdates.length === 0) {
      this.isLoading = false;
      return;
    }

    forkJoin(allUpdates).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (updatedProducts) => {
        if (selectedProductUpdates.length > 0) {
          this.selectedProducts = [...updatedProducts.slice(0, selectedProductUpdates.length)];
        }

        const categoryUpdates = updatedProducts.slice(selectedProductUpdates.length);
        const categoryUpdateMap = new Map<string, ShoppingListItemDTO[]>();

        categoryUpdates.forEach((product: any) => {
          const categoryId = product.categoryId;
          if (!categoryUpdateMap.has(categoryId)) {
            categoryUpdateMap.set(categoryId, []);
          }
          categoryUpdateMap.get(categoryId)!.push(product);
        });

        this.categories.forEach(category => {
          const updatedCategoryProducts = categoryUpdateMap.get(category.id);
          if (updatedCategoryProducts) {
            if (category.id === 'best-price') {
              const preservedProducts = updatedCategoryProducts.map(updatedProduct => {
                const originalProduct = category.products.find(p => p.productId === updatedProduct.productId);
                return {
                  ...updatedProduct,
                  originalBestPrice: (originalProduct as any)?.originalBestPrice,
                  originalBestStore: (originalProduct as any)?.originalBestStore
                };
              });
              category.products = [...preservedProducts];
            } else {
              category.products = [...updatedCategoryProducts];
            }
          }
        });

        this.filteredProducts = this.filteredProducts.map(p => {
          const updatedProduct = updatedProducts.find((up: any) => up.productId === p.productId);
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
      }
    });
  }

  onUpdateProductStore(event: { productId: string, newStore: string }): void {
    this.updateProductPricesForStore(event.newStore);
  }

  hasEditPermission(): boolean {
    if (!this.currentList) {
      return false;
    }

    if (this.currentList.ownerId === this.userId) {
      return true;
    }

    const userCollaborator = this.currentList.collaborators.find(c => c.userId === this.userId);
    return userCollaborator?.permission === PermissionEnum.EDIT;
  }

  private getFavoriteProducts(): ShoppingListItemDTO[] {
    return this.filteredProducts.filter(product =>
      this.favoriteProducts.some(fav => fav.productId === product.productId)
    );
  }

  private loadSpecialCategories(): void {
    this.productService.getTopProducts().subscribe(topProducts => {
      const peoplesChoiceCategory = this.categories.find(cat => cat.id === 'peoples-choice');
      if (peoplesChoiceCategory && topProducts.length > 0) {
        this.shoppingListService.getAllProducts().subscribe(allProducts => {
          const matchedProducts = topProducts.map(topProduct => {
            const matchingProduct = allProducts.find(p =>
              p.productName.toLowerCase().trim() === topProduct.productName.toLowerCase().trim()
            );

            if (matchingProduct) {
              return {
                id: matchingProduct.productId,
                productId: matchingProduct.productId,
                productName: matchingProduct.productName,
                price: topProduct.price,
                storeName: topProduct.storeName,
                storeId: matchingProduct.storeId || '',
                isChecked: false,
                quantity: 1
              };
            } else {
              return {
                id: this.generateProductId(topProduct.productName),
                productId: this.generateProductId(topProduct.productName),
                productName: topProduct.productName,
                price: topProduct.price,
                storeName: topProduct.storeName,
                storeId: '',
                isChecked: false,
                quantity: 1
              };
            }
          });

          const uniqueProducts = this.deduplicateProductsByPrice(matchedProducts);
          peoplesChoiceCategory.products = uniqueProducts.slice(0, 10);
        });
      }
    });

    this.priceComparisonService.getAllItems(this.userId).subscribe(allProducts => {
      const bestPriceCategory = this.categories.find(cat => cat.id === 'best-price');
      if (bestPriceCategory) {

        if (allProducts && allProducts.length > 0) {
          const priceRequests = allProducts.map(product =>
            this.priceComparisonService.getItemPrices(this.userId, product.id).pipe(
              map(prices => {
                if (prices && prices.length > 0) {
                  const cheapestPrice = prices.reduce((min, current) =>
                    (!min || (current.price && current.price < min.price)) ? current : min
                  );

                  return {
                    id: product.id,
                    productId: product.id,
                    productName: product.name,
                    price: cheapestPrice.price,
                    storeName: cheapestPrice.storeName,
                    storeId: cheapestPrice.storeId,
                    isChecked: false,
                    quantity: 1,
                    originalBestPrice: cheapestPrice.price,
                    originalBestStore: cheapestPrice.storeName
                  } as any;
                }
                return null;
              })
            )
          );

          forkJoin(priceRequests).subscribe(productsWithPrices => {
            const validProducts = productsWithPrices.filter(product =>
              product && product.price && product.price > 0
            ) as ShoppingListItemDTO[];

            const uniqueProducts = this.deduplicateProductsByPrice(validProducts);

            bestPriceCategory.products = uniqueProducts
              .sort((a, b) => (a.price || 0) - (b.price || 0))
              .slice(0, 10);
          });
        } else {
          bestPriceCategory.products = [];
        }
      } else {
        bestPriceCategory!.products = [];
      }
    });
  }

  private deduplicateProductsByPrice(products: ShoppingListItemDTO[]): ShoppingListItemDTO[] {
    const productMap = new Map<string, ShoppingListItemDTO>();

    products.forEach(product => {
      const key = product.productName.toLowerCase().trim();
      const existingProduct = productMap.get(key);

      if (!existingProduct) {
        productMap.set(key, product);
      } else {
        const currentPrice = product.price || 0;
        const existingPrice = existingProduct.price || 0;

        if (currentPrice > 0 && (existingPrice === 0 || currentPrice < existingPrice)) {
          productMap.set(key, product);
        }
      }
    });

    return Array.from(productMap.values());
  }

  private generateProductId(productName: string): string {
    return 'product-' + productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  }
}
