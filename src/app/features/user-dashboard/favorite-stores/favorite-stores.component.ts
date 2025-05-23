import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoriteStoresService } from '@app/services/favorite-stores.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StoreDTO } from '@app/models/store.dto';
import { FavoriteStoreDTO } from '@app/models/favorite-store.dto';

@Component({
  selector: 'app-favorite-stores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorite-stores.component.html',
  styleUrls: ['./favorite-stores.component.css']
})
export class FavoriteStoresComponent implements OnInit {
  favoriteStores$!: Observable<FavoriteStoreDTO[]>;
  searchResults$!: Observable<StoreDTO[]>;
  showAddForm = false;
  searchQuery = '';
  userId: string;
  private searchTerms = new Subject<string>();

  constructor(private favoriteStoresService: FavoriteStoresService) {
    const userInfo = localStorage.getItem('userInfo');
    this.userId = userInfo ? JSON.parse(userInfo).id : '';
    if (!this.userId) {
      throw new Error('User ID not found. Please log in again.');
    }
  }

  ngOnInit(): void {
    this.loadFavoriteStores();

    this.searchResults$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.favoriteStoresService.searchStores(this.userId, term))
    );
  }

  loadFavoriteStores(): void {
    this.favoriteStores$ = this.favoriteStoresService.getFavoriteStores(this.userId);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.searchQuery = '';
    if (!this.showAddForm) {
      this.searchTerms.next('');
    }
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  addStore(store: StoreDTO): void {
    this.favoriteStoresService.addFavoriteStore(this.userId, store.id)
      .subscribe(() => {
        this.loadFavoriteStores();
        this.toggleAddForm();
      });
  }

  removeStore(storeId: string): void {
    this.favoriteStoresService.removeFavoriteStore(this.userId, storeId)
      .subscribe({
        next: () => {
          this.loadFavoriteStores();
        },
        error: (error) => {
          if (error.status === 404 || error.message?.toLowerCase().includes('not found')) {
            this.loadFavoriteStores();
            return;
          }
          console.error('Failed to remove store:', error);
        }
      });
  }
}
