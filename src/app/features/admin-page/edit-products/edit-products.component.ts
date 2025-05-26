// src/app/features/admin-page/edit-products/edit-products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { RouterModule }       from '@angular/router';

import {
  StoreService,
  StoreDTO,
  StorePriceDTO
} from '../../../services/store.service';
import {
  ProductService,
  AddProductPayload,
  BulkResultDTO         // ← import your result DTO
} from '../../../services/product.service';

@Component({
  selector: 'app-edit-products',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './edit-products.component.html',
  styleUrls: ['./edit-products.component.css']
})
export class EditProductsComponent implements OnInit {
  stores: StoreDTO[]        = [];
  selectedStoreId = '';
  products: StorePriceDTO[] = [];

  constructor(
    private storeSvc:   StoreService,
    private productSvc: ProductService
  ) {}

  ngOnInit(): void {
    this.storeSvc.getStores()
      .subscribe(list => this.stores = list);
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
        storeId:      p.storeId,
        productId:    p.productId,
        productName:  p.productName,
        category:     p.category,
        description:  p.description,
        price:        priceNum,
        barcode:      p.barcode ?? '',
        isActive:     p.isActive
      };
    });

    this.productSvc.bulkAddProducts(payload).subscribe({
      next: (res: BulkResultDTO) => {
        if (res.success) {
          alert(`Successfully updated ${res.count} products.`);
        } else {
          alert(`Validation failed:\n${res.errors?.join('\n')}`);
        }
      },
      error: e => {
        const body = e.error as BulkResultDTO;
        if (body?.errors) {
          alert(`Server error (${e.status}):\n${body.errors.join('\n')}`);
        } else {
          alert(`Unexpected error (${e.status}): ${e.message}`);
        }
      }
    });
  }
}
