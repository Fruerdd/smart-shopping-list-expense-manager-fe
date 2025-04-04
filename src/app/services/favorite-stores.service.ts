import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FavoriteStore {
  id: number;
  name: string;
  icon: string;
}

export interface StoreSearchResult {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteStoresService {
  private favoriteStores: FavoriteStore[] = [
    {
      id: 1,
      name: 'Mercator',
      icon: '🛒'
    },
    {
      id: 2,
      name: 'Bingo',
      icon: '🛍️'
    }
  ];

  private allStores: StoreSearchResult[] = [
    { id: 1, name: 'BEST' },
    { id: 2, name: 'Amko Komerc' },
    { id: 3, name: 'Konzum' },
    { id: 4, name: 'Hose Komerc' },
    { id: 5, name: 'Mercator' },
    { id: 6, name: 'Bingo' }
  ];

  getFavoriteStores(): Observable<FavoriteStore[]> {
    return of(this.favoriteStores);
  }

  searchStores(query: string): Observable<StoreSearchResult[]> {
    if (!query) {
      return of([]);
    }

    const lcQuery = query.toLowerCase();
    const availableStores = this.allStores.filter(store =>
      store.name.toLowerCase().includes(lcQuery) &&
      !this.favoriteStores.some(fav => fav.name === store.name)
    );
    return of(availableStores);
  }

  addFavoriteStore(store: Partial<FavoriteStore>): Observable<FavoriteStore> {
    const maxId = Math.max(...this.favoriteStores.map(s => s.id), 0);
    const newStore = {
      ...store,
      id: maxId + 1,
      icon: store.icon || '🏪'
    } as FavoriteStore;

    this.favoriteStores.push(newStore);
    return of(newStore);
  }

  removeFavoriteStore(id: number): Observable<boolean> {
    const initialLength = this.favoriteStores.length;
    this.favoriteStores = this.favoriteStores.filter(s => s.id !== id);
    return of(initialLength > this.favoriteStores.length);
  }
}
