import { Component, OnInit } from '@angular/core';
import { PriceComparisonService } from '@app/services/price-comparison.service';
import { ProductDTO } from '@app/models/product.dto';
import { StorePriceDTO } from '@app/models/store-price.dto';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';

type SanitizedStorePrice = Omit<StorePriceDTO, 'storeIcon'> & { storeIcon: SafeHtml };

@Component({
  selector: 'app-price-comparison',
  templateUrl: './price-comparison.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    MatIconModule,
    MatIcon
  ],
  styleUrls: ['./price-comparison.component.css']
})
export class PriceComparisonComponent implements OnInit {
  searchTerm: string = '';
  items: ProductDTO[] = [];
  filteredItems: ProductDTO[] = [];
  selectedItem: ProductDTO | null = null;
  storePrices: SanitizedStorePrice[] = [];
  showSearchResults: boolean = false;
  userId: string;

  constructor(
    private priceComparisonService: PriceComparisonService,
    private sanitizer: DomSanitizer
  ) {
    const userInfo = localStorage.getItem('userInfo');
    this.userId = userInfo ? JSON.parse(userInfo).id : '';
    if (!this.userId) {
      throw new Error('User ID not found. Please log in again.');
    }
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.priceComparisonService.getAllItems(this.userId).subscribe(
      (data: ProductDTO[]) => {
        this.items = data;
        this.filteredItems = [...data];
      },
      error => {
        console.error('Error loading items:', error);
      }
    );
  }

  onSearchFocus(): void {
    this.showSearchResults = true;
    this.filterItems();
  }

  onSearchBlur(): void {
    setTimeout(() => {
      if (!this.selectedItem) {
        this.showSearchResults = false;
      }
    }, 300);
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectItem(item: ProductDTO): void {
    this.selectedItem = item;
    this.searchTerm = item.name;
    this.showSearchResults = false;

    this.priceComparisonService.getItemPrices(this.userId, item.id).subscribe(
      (prices: StorePriceDTO[]) => {
        this.storePrices = prices.map(price => ({
          ...price,
          storeIcon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" fill="#e91e63"/></svg>')
        }));
      },
      error => {
        console.error('Error loading item prices:', error);
      }
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedItem = null;
    this.storePrices = [];
    this.filterItems();
  }
}
