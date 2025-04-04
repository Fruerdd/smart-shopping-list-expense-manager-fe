import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoriteStoresService, FavoriteStore, StoreSearchResult } from '@app/services/favorite-stores.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-favorite-stores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorite-stores.component.html',
  styleUrls: ['./favorite-stores.component.css']
})
export class FavoriteStoresComponent implements OnInit {
  favoriteStores$!: Observable<FavoriteStore[]>;
  searchResults$!: Observable<StoreSearchResult[]>;
  showAddForm = false;
  newStoreName = '';
  searchQuery = '';
  private searchTerms = new Subject<string>();

  constructor(private favoriteStoresService: FavoriteStoresService) {}

  ngOnInit(): void {
    this.loadFavoriteStores();

    this.searchResults$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.favoriteStoresService.searchStores(term))
    );
  }

  loadFavoriteStores(): void {
    this.favoriteStores$ = this.favoriteStoresService.getFavoriteStores();
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

  addStore(store: StoreSearchResult): void {
    if (this.newStoreName.trim() === '') return;

    this.favoriteStoresService.addFavoriteStore({
      id: store.id,
      name: store.name,
      icon: '🏪'
    }).subscribe(() => {
      this.loadFavoriteStores();
      this.toggleAddForm();
    });
  }

  removeStore(id: number): void {
    this.favoriteStoresService.removeFavoriteStore(id)
      .subscribe(() => this.loadFavoriteStores());
  }
}
