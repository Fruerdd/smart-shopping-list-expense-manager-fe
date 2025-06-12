import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  StoreDTO,
  StoreDetailsDTO,
  StoreService,
  AvailableProductDTO
} from '@app/services/store.service';

import { AddProductPayload, ProductService } from '@app/services/product.service';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {
  stores: StoreDTO[] = [];
  store: StoreDetailsDTO | null = null;
  storeId: string | null = null;
  availableProducts: AvailableProductDTO[] = [];
  csvProducts: AddProductPayload[] = [];

  searchTerm: string = '';
  filterCategory: string = '';
  currentPage: number = 1;
  readonly pageSize: number = 10;

  constructor(
    private storeSvc: StoreService,
    private productSvc: ProductService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.storeSvc.getStores().subscribe((sts: StoreDTO[]) => {
      this.stores = sts;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;
        this.loadStore(id);
        this.loadAvailableProducts(id);
      } else {
        this.storeId = null;
        this.store = null;
        this.availableProducts = [];
      }
    });
  }

  onStoreSelected(id: string): void {
    if (id) {
      this.router.navigate(['/admin-page/add-products', id]);
    } else {
      this.router.navigate(['/admin-page/add-products']);
    }
  }

  private loadStore(id: string): void {
    this.storeSvc.getStore(id)
      .subscribe((s: StoreDetailsDTO) => {
        this.store = s;
      });
  }

  private loadAvailableProducts(id: string): void {
    this.storeSvc.getAvailableProducts(id)
      .subscribe((list: AvailableProductDTO[]) => {
        this.availableProducts = list;
        this.searchTerm = '';
        this.filterCategory = '';
        this.currentPage = 1;
      });
  }

  get categories(): string[] {
    const cats = Array.from(
      new Set(
        this.availableProducts
          .map(p => p.category)
          .filter(c => !!c)
      )
    );
    return cats.sort((a, b) => a.localeCompare(b));
  }

  get filteredProducts(): AvailableProductDTO[] {
    let items = this.availableProducts;
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      items = items.filter(p =>
        p.productName.toLowerCase().includes(term)
      );
    }
    if (this.filterCategory && this.filterCategory !== '') {
      items = items.filter(p => p.category === this.filterCategory);
    }
    return items;
  }

  get totalPages(): number {
    const len = this.filteredProducts.length;
    const tp = Math.ceil(len / this.pageSize);
    return tp > 0 ? tp : 1;
  }

  get pagedProducts(): AvailableProductDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onSearchTermChange(): void {
    this.currentPage = 1;
  }
  onFilterCategoryChange(): void {
    this.currentPage = 1;
  }

  addToStore(item: AvailableProductDTO): void {
    if (!this.storeId) return;

    const payload: AddProductPayload = {
      storeId: this.storeId,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      description: item.description,
      price: 0,
      barcode: '',
      isActive: item.active
    };

    this.productSvc.bulkAddProducts([payload]).subscribe({
      next: () => {
        this.snackBar.open(
          `${item.productName} added to ${this.store?.name}`,
          '',
          { duration: 3000 }
        );
        this.loadAvailableProducts(this.storeId!);
      },
      error: e => {
        this.snackBar.open(
          `Error: ${e.message}`,
          '',
          { duration: 5000 }
        );
      }
    });
  }

  onFileSelected(evt: Event): void {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file || !this.storeId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const headers = lines.shift()!.split(',').map(h => h.trim());

      this.csvProducts = lines.map(line => {
        const cols = line.split(',').map(c => c.trim());
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = cols[i] || '');
        return {
          storeId: this.storeId!,
          productName: obj['productName'],
          category: obj['category'],
          description: obj['description'],
          price: parseFloat(obj['price']) || 0,
          barcode: obj['barcode'],
          isActive: obj['isActive']?.toLowerCase() === 'true'
        } as AddProductPayload;
      });
    };
    reader.readAsText(file);
  }

  onSubmitCsv(): void {
    if (!this.csvProducts.length) return;

    this.productSvc.bulkAddProducts(this.csvProducts).subscribe({
      next: () => {
        this.snackBar.open(
          `CSV products uploaded successfully!`,
          '',
          { duration: 3000 }
        );
        this.csvProducts = [];
      },
      error: e => {
        this.snackBar.open(
          `CSV upload error:<br>${e.message}`,
          '',
          { duration: 5000 }
        );
      }
    });
  }
}
