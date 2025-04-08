import { Injectable } from '@angular/core';
import {map, Observable, of} from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ShareOption {
  id: string;
  name: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  image: string;
  price?: number;
  storeName?: string;
  category: string;
  quantity?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  description: string;
  type: string;
  shareWith: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface StoreItem {
  storeId: string;
  storeName: string;
  storeIcon: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  products: ShoppingListItem[];
}

export interface SidebarCategory {
  id: string;
  name: string;
  expanded?: boolean;
  icon?: string;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListPageService {
  private mockCategories: Category[] = [
    {
      id: 'favorite',
      name: 'Favorite Items',
      products: [
        { id: '1', name: 'Paradajz 1kg', image: 'assets/images/item-img-generic.png', price: 2.99, storeName: 'KONZUM', category: 'favorite' },
        { id: '2', name: 'City Pašteta 100g Classic', image: 'assets/images/item-img-generic.png', price: 1.89, storeName: 'BINGO', category: 'favorite' },
        { id: '3', name: 'Vegeta Original 250g', image: 'assets/images/item-img-generic.png', price: 3.49, storeName: 'MERKATOR', category: 'favorite' },
        { id: '4', name: 'SIRELA ABC meki sir 250g', image: 'assets/images/item-img-generic.png', price: 4.09, storeName: 'MERKATOR', category: 'favorite' },
        { id: '5', name: 'GOVEDINA Dimljena bez koske narezana 100g', image: 'assets/images/item-img-generic.png', price: 5.99, storeName: 'MERKATOR', category: 'favorite' },
        { id: '6', name: 'Kukuruz 200g', image: 'assets/images/item-img-generic.png', price: 3.19, storeName: 'BINGO', category: 'favorite' },
        { id: '7', name: 'Dimljeni sir 400g', image: 'assets/images/item-img-generic.png', price: 1.55, storeName: 'BINGO', category: 'favorite' },
        { id: '8', name: 'Milkos Mlijeko 1L', image: 'assets/images/item-img-generic.png', price: 3.49, storeName: 'MERKATOR', category: 'favorite' },
        { id: '9', name: 'Milka Mlijecna Cokolada 200g', image: 'assets/images/item-img-generic.png', price: 5.99, storeName: 'BINGO', category: 'favorite' },
        { id: '10', name: 'Pileci file 1kg', image: 'assets/images/item-img-generic.png', price: 9.49, storeName: 'KONZUM', category: 'favorite' }
      ]
    },
    {
      id: 'best-price',
      name: 'Best price',
      products: [
        { id: '6', name: 'Paradajz 1kg', image: 'assets/images/item-img-generic.png', price: 2.49, storeName: 'KONZUM', category: 'best-price' },
        { id: '7', name: 'City Pašteta 100g Classic', image: 'assets/images/item-img-generic.png', price: 1.79, storeName: 'BINGO', category: 'best-price' },
        { id: '8', name: 'Vegeta Original 250g', image: 'assets/images/item-img-generic.png', price: 3.29, storeName: 'MERKATOR', category: 'best-price' },
        { id: '9', name: 'SIRELA ABC meki sir 250g', image: 'assets/images/item-img-generic.png', price: 3.99, storeName: 'MERKATOR', category: 'best-price' },
        { id: '10', name: 'GOVEDINA Dimljena bez koske narezana 100g', image: 'assets/images/item-img-generic.png', price: 5.49, storeName: 'MERKATOR', category: 'best-price' }
      ]
    },
    {
      id: 'peoples-choice',
      name: 'People\'s choice',
      products: [
        { id: '11', name: 'PARADAJZ', image: 'assets/images/item-img-generic.png', price: 2.79, storeName: 'BINGO', category: 'peoples-choice' },
        { id: '12', name: 'City Pašteta 100g Classic', image: 'assets/images/item-img-generic.png', price: 1.89, storeName: 'KONZUM', category: 'peoples-choice' },
        { id: '13', name: 'Vegeta Original 250g', image: 'assets/images/item-img-generic.png', price: 3.39, storeName: 'MERKATOR', category: 'peoples-choice' },
        { id: '14', name: 'SIRELA ABC meki sir 250g', image: 'assets/images/item-img-generic.png', price: 4.09, storeName: 'MERKATOR', category: 'peoples-choice' },
        { id: '15', name: 'GOVEDINA Dimljena bez koske narezana 100g', image: 'assets/images/item-img-generic.png', price: 5.59, storeName: 'MERKATOR', category: 'peoples-choice' }
      ]
    },
    {
      id: 'sweets-snacks',
      name: 'SWEETS & SNACKS',
      products: [
        { id: '16', name: 'SNICKERS', image: 'assets/images/item-img-generic.png', price: 1.19, storeName: 'KONZUM', category: 'sweets-snacks' },
        { id: '17', name: 'DONUTS', image: 'assets/images/item-img-generic.png', price: 1.39, storeName: 'MERKATOR', category: 'sweets-snacks' },
        { id: '18', name: 'CHEWING GUM', image: 'assets/images/item-img-generic.png', price: 0.89, storeName: 'KONZUM', category: 'sweets-snacks' }
      ]
    },
    {
      id: 'drinks',
      name: 'DRINKS',
      products: [
        { id: '19', name: 'COCA COLA', image: 'assets/images/item-img-generic.png', price: 2.19, storeName: 'KONZUM', category: 'drinks' },
        { id: '20', name: 'CAPPY PULPY', image: 'assets/images/item-img-generic.png', price: 1.99, storeName: 'BINGO', category: 'drinks' },
        { id: '21', name: 'FANTA ORANGE', image: 'assets/images/item-img-generic.png', price: 2.09, storeName: 'BINGO', category: 'drinks' }
      ]
    },
    {
      id: 'dairy',
      name: 'DAIRY PRODUCTS',
      products: [
        { id: '22', name: 'VINDIJA SVJEŽE MLIJEKO', image: 'assets/images/item-img-generic.png', price: 2.49, storeName: 'BINGO', category: 'dairy' },
        { id: '23', name: 'MILLIYO DESERT', image: 'assets/images/item-img-generic.png', price: 3.79, storeName: 'BINGO', category: 'dairy' },
        { id: '24', name: 'JOGURT', image: 'assets/images/item-img-generic.png', price: 0.99, storeName: 'KONZUM', category: 'dairy' },
        { id: '25', name: 'PUDING', image: 'assets/images/item-img-generic.png', price: 0.59, storeName: 'MERKATOR', category: 'dairy' },
        { id: '26', name: 'VINDIJA', image: 'assets/images/item-img-generic.png', price: 1.19, storeName: 'BINGO', category: 'dairy' }
      ]
    }
  ];

  private mockLists: ShoppingList[] = [
    {
      id: '1',
      name: 'Weekly Groceries',
      description: 'Regular items we need every week',
      type: 'grocery',
      shareWith: 'family',
      items: [
        { id: '1', name: 'Paradajz 1kg', image: 'assets/images/item-img-generic.png', price: 2.99, storeName: 'KONZUM', category: 'favorite', quantity: 2 },
        { id: '24', name: 'JOGURT', image: 'assets/images/item-img-generic.png', price: 0.99, storeName: 'KONZUM', category: 'dairy', quantity: 4 },
        { id: '12', name: 'City Pašteta 100g Classic', image: 'assets/images/item-img-generic.png', price: 1.89, storeName: 'KONZUM', category: 'peoples-choice', quantity: 1 }
      ],
      createdAt: new Date('2025-03-28'),
      updatedAt: new Date('2025-04-01'),
      userId: 'user123'
    },
    {
      id: '2',
      name: 'Party Supplies',
      description: 'Items for the weekend gathering',
      type: 'other',
      shareWith: 'private',
      items: [
        { id: '19', name: 'COCA COLA', image: 'assets/images/item-img-generic.png', price: 2.19, storeName: 'BINGO', category: 'drinks', quantity: 1 },
        { id: '20', name: 'FANTA', image: 'assets/images/item-img-generic.png', price: 2.09, storeName: 'BINGO', category: 'drinks', quantity: 1 },
        { id: '17', name: 'DONUTS', image: 'assets/images/item-img-generic.png', price: 1.19, storeName: 'BINGO', category: 'sweets-snacks', quantity: 12 }
      ],
      createdAt: new Date('2025-04-02'),
      updatedAt: new Date('2025-04-02'),
      userId: 'user123'
    }
  ];

  private sidebarCategories: SidebarCategory[] = [
    { id: 'bakery', name: 'BAKERY', icon: 'bakery_dining' },
    { id: 'fruits-veggies', name: 'FRUITS & VEGGIES', icon: 'eco' },
    { id: 'beverages', name: 'BEVERAGES', icon: 'local_bar' },
    { id: 'dairy', name: 'DAIRY PRODUCTS', icon: 'breakfast_dining' },
    { id: 'frozen', name: 'FROZEN FOOD', icon: 'ac_unit' },
    { id: 'canned', name: 'CANNED FOODS', icon: 'inventory_2' },
    { id: 'seafood', name: 'SEAFOOD', icon: 'set_meal' },
    { id: 'coffee', name: 'COFFEE & TEA', icon: 'coffee' },
    { id: 'poultry', name: 'POULTRY', icon: 'egg_alt' },
    { id: 'pasta', name: 'PASTA & RICE', icon: 'restaurant' },
    { id: 'eggs', name: 'EGGS', icon: 'egg' },
    { id: 'sauces', name: 'SAUCES & CONDIMENTS', icon: 'local_fire_department' },
    { id: 'breakfast', name: 'BREAKFAST', icon: 'free_breakfast' },
    { id: 'healthy', name: 'HEALTHY FOOD', icon: 'eco' },
    { id: 'produce', name: 'PRODUCE', icon: 'grass' },
    { id: 'sweets-snacks', name: 'SWEETS & SNACKS', icon: 'cake' }
  ];

  constructor() { }

  getCategories(): Observable<Category[]> {

    return of(this.mockCategories).pipe(
      catchError(this.handleError<Category[]>('getCategories', []))
    );
  }

  getSidebarCategories(): Observable<SidebarCategory[]> {
    return of(this.sidebarCategories).pipe(
      catchError(this.handleError<SidebarCategory[]>('getSidebarCategories', []))
    );
  }

  getAllProducts(): Observable<ShoppingListItem[]> {

    const allProducts = this.mockCategories.reduce((products, category) => {
      return [...products, ...category.products];
    }, [] as ShoppingListItem[]);

    return of(allProducts).pipe(
      catchError(this.handleError<ShoppingListItem[]>('getAllProducts', []))
    );
  }

  getListById(id: string): Observable<ShoppingList | null> {

    const list = this.mockLists.find(list => list.id === id);
    return of(list || null).pipe(
      catchError(this.handleError<ShoppingList | null>('getListById', null))
    );
  }

  createList(list: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>): Observable<ShoppingList> {

    const newList: ShoppingList = {
      ...list,
      id: (this.mockLists.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockLists.push(newList);
    return of(newList).pipe(
      catchError(this.handleError<ShoppingList>('createList'))
    );
  }

  updateList(id: string, updates: Partial<ShoppingList>): Observable<ShoppingList | null> {

    const index = this.mockLists.findIndex(list => list.id === id);
    if (index === -1) {
      return of(null);
    }

    const updatedList: ShoppingList = {
      ...this.mockLists[index],
      ...updates,
      updatedAt: new Date()
    };

    this.mockLists[index] = updatedList;
    return of(updatedList).pipe(
      catchError(this.handleError<ShoppingList | null>('updateList', null))
    );
  }

  getItemPriceComparisons(itemId: string): Observable<StoreItem[]> {

    const product = this.mockCategories
      .flatMap(category => category.products)
      .find(product => product.id === itemId);

    if (!product) {
      return of([]);
    }

    const basePrice = product.price || 1.99;

    const storeData = [
      { id: 'merkator', name: 'MERKATOR', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#f44336"/></svg>', priceFactor: 1.0},
      { id: 'konzum', name: 'KONZUM', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#e91e63"/></svg>', priceFactor: 0.95},
      { id: 'bingo', name: 'BINGO', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#4caf50"/></svg>', priceFactor: 1.05},
      { id: 'lidl', name: 'LIDL', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#2196f3"/></svg>', priceFactor: 0.90},
    ];

    const mockPriceComparisons: StoreItem[] = storeData.map(store => ({
      storeId: store.id,
      storeName: store.name,
      storeIcon: store.icon,
      price: parseFloat((basePrice * store.priceFactor).toFixed(2))
    }));

    return of(mockPriceComparisons).pipe(
      catchError(this.handleError<StoreItem[]>('getItemPriceComparisons', []))
    );
  }

  searchProducts(term: string): Observable<ShoppingListItem[]> {
    if (!term.trim()) {
      return this.getAllProducts();
    }

    const lowerTerm = term.toLowerCase();
    const allProducts = this.mockCategories.flatMap(category => category.products);
    const filteredProducts = allProducts.filter(product => {
      return product.name.toLowerCase().includes(lowerTerm) ||
        (product.category && product.category.toLowerCase().includes(lowerTerm)) ||
        (product.storeName && product.storeName.toLowerCase().includes(lowerTerm));
    });

    return of(filteredProducts).pipe(
      catchError(this.handleError<ShoppingListItem[]>('searchProducts', []))
    );
  }

  getProductsByCategory(categoryId: string): Observable<ShoppingListItem[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(product => {
        return (product as any).category === categoryId;
      }))
    );
  }

  getAllAvailableStores(): Observable<{ storeName: string; storeIcon: string; }[]> {
    const mockStores = [
      { storeName: 'BINGO', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#4caf50"/></svg>' },
      { storeName: 'KONZUM', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#e91e63"/></svg>' },
      { storeName: 'MERKATOR', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#f44336"/></svg>' },
      { storeName: 'LIDL', storeIcon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#2196f3"/></svg>' }
    ];

    return of(mockStores).pipe(
      catchError(this.handleError<{ storeName: string; storeIcon: string; }[]>('getAllAvailableStores', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
