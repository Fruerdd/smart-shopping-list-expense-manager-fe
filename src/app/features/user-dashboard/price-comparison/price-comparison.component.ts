import { Component, OnInit } from '@angular/core';
import { PriceComparisonService } from '@app/services/price-comparison.service';
import { Item, StorePrice } from '@app/services/price-comparison.service';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

type SanitizedStorePrice = Omit<StorePrice, 'storeIcon'> & { storeIcon: SafeHtml };
@Component({
  selector: 'app-price-comparison',
  templateUrl: './price-comparison.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule
  ],
  styleUrls: ['./price-comparison.component.css']
})
export class PriceComparisonComponent implements OnInit {
  searchTerm: string = '';
  items: Item[] = [];
  filteredItems: Item[] = [];
  selectedItem: Item | null = null;
  storePrices: SanitizedStorePrice[] = [];
  showSearchResults: boolean = false;

  constructor(
    private priceComparisonService: PriceComparisonService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.priceComparisonService.getAllItems().subscribe(
      (data: Item[]) => {
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

  selectItem(item: Item): void {
    console.log('Item selected:', item);
    this.selectedItem = item;
    this.searchTerm = item.name;
    this.showSearchResults = false;

    this.priceComparisonService.getItemPrices(item.id).subscribe(
      (prices: StorePrice[]) => {
        this.storePrices = prices.map(price => ({
          ...price,
          storeIcon: this.sanitizer.bypassSecurityTrustHtml(price.storeIcon)
        }));
      },
      error => {
        console.error('Error loading item prices:', error);
      }
    );
  }

  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedItem = null;
    this.storePrices = [];
    this.filterItems();
  }
}
