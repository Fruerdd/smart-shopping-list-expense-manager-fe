import { Component, OnInit, AfterViewInit, OnDestroy, HostBinding, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StoreDTO, StorePriceDTO, StoreService } from '@app/services/store.service';
import { AddProductPayload, BulkResultDTO, ProductService } from '@app/services/product.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HtmlSnackComponent } from '@app/html-snack/html-snack.component';

@Component({
  selector: 'app-edit-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-products.component.html',
  styleUrls: ['./edit-products.component.css']
})
export class EditProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  stores: StoreDTO[] = [];
  selectedStoreId = '';
  products: StorePriceDTO[] = [];

  // HostBinding to apply `min-height: ...px` inline on the host element
  @HostBinding('style.minHeight.px') minHeightPx: number | null = null;

  // We use NgZone to manage the resize listener outside Angular zone for performance,
  // but still update binding inside Angular.
  private onResizeHandler = () => {
    this.calculateMinHeight();
  };

  constructor(
    private storeSvc: StoreService,
    private productSvc: ProductService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.storeSvc.getStores()
      .subscribe(list => this.stores = list);
  }

  ngAfterViewInit(): void {
    // Initial calculation
    this.calculateMinHeight();

    // Listen to window resize outside Angular, then re-enter Angular to update binding
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResizeHandler);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResizeHandler);
  }

  private calculateMinHeight(): void {
    // Query your header and footer. Adjust selectors if needed.
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');

    const headerHeight = headerEl?.getBoundingClientRect().height || 0;
    const footerHeight = footerEl?.getBoundingClientRect().height || 0;

    // Compute available height
    const available = window.innerHeight - headerHeight - footerHeight;

    // In rare cases, available might be negative; guard:
    this.minHeightPx = available > 0 ? available : 0;
  }

  onStoreChange(storeId: string) {
    this.selectedStoreId = storeId;
    if (!storeId) {
      this.products = [];
      return;
    }
    this.storeSvc.getStoreProducts(storeId)
      .subscribe(list => this.products = list);
  }

  submitChanges() {
    const payload: AddProductPayload[] = this.products.map(p => {
      const priceNum = parseFloat(String(p.price).replace(',', '.'));
      return {
        storePriceId: p.storePriceId,
        storeId: p.storeId,
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        description: p.description,
        price: priceNum,
        barcode: p.barcode ?? '',
        isActive: p.isActive
      };
    });

    this.productSvc.bulkAddProducts(payload).subscribe({
      next: (res: BulkResultDTO) => {
        if (res.success) {
          this.showNotification(
            `<b>Updated ${res.count} products</b> successfully!`,
            3000
          );
        } else {
          this.showNotification(
            `Validation failed:<br>${res.errors?.join('<br>')}`,
            5000
          );
        }
      },
      error: e => {
        const body = e.error as BulkResultDTO;
        if (body?.errors) {
          this.showNotification(
            `Server error (${e.status}):<br>${body.errors.join('<br>')}`,
            5000
          );
        } else {
          this.showNotification(
            `Unexpected error (${e.status}):<br>${e.message}`,
            5000
          );
        }
      }
    });
  }

  private showNotification(message: string, duration = 3000) {
    this.snackBar.openFromComponent(HtmlSnackComponent, {
      data: { message },
      duration
    });
  }
}
