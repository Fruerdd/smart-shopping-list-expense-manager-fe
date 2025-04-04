import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FavoriteProduct {
  id: number;
  name: string;
  icon: string;
}

export interface ProductSearchResult {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteProductsService {
  private favoriteProducts: FavoriteProduct[] = [
    {
      id: 1,
      name: 'Bread',
      icon: '🍞'
    },
    {
      id: 2,
      name: 'Apples',
      icon: '🍎'
    }
  ];

  private allProducts: FavoriteProduct[] = [
    { id: 1, name: 'Bread', icon: '🍞' },
    { id: 2, name: 'Apples', icon: '🍎' },
    { id: 3, name: 'Milk', icon: '🥛' },
    { id: 4, name: 'Eggs', icon: '🥚' },
    { id: 5, name: 'Cheese', icon: '🧀' }
  ];

  searchProducts(query: string): Observable<FavoriteProduct[]> {
    if (!query) {
      return of([]);
    }

    const lcQuery = query.toLowerCase();
    const availableProducts = this.allProducts.filter(product =>
      product.name.toLowerCase().includes(lcQuery) &&
      !this.favoriteProducts.some(fav => fav.name === product.name)
    );
    return of(availableProducts);
  }

  getFavoriteProducts(): Observable<FavoriteProduct[]> {
    return of(this.favoriteProducts);
  }

  addFavoriteProduct(product: FavoriteProduct): Observable<FavoriteProduct> {
    const maxId = Math.max(...this.favoriteProducts.map(p => p.id), 0);
    const newProduct = { ...product, id: maxId + 1 };
    this.favoriteProducts.push(newProduct);
    return of(newProduct);
  }

  removeFavoriteProduct(id: number): Observable<boolean> {
    const initialLength = this.favoriteProducts.length;
    this.favoriteProducts = this.favoriteProducts.filter(p => p.id !== id);
    return of(initialLength > this.favoriteProducts.length);
  }
}
