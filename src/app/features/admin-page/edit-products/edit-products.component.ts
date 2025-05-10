import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { RouterModule }  from '@angular/router';

import {
  StoreService,
  StoreDTO,
  StorePriceDTO
} from '../../../services/store.service';
import {
  ProductService,
  AddProductPayload
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
      // normalize price string → number
      const priceNum = parseFloat(String(p.price).replace(',', '.'));
  
      return {
        storePriceId: p.storePriceId,
        storeId:      p.storeId,
        productId:    p.productId,
        productName:  p.productName,
        category:     p.category,            // now uses the edited value
        description:  p.description,         // now uses the edited value
        price:        priceNum,
        barcode:      p.barcode ?? '',
        isActive:     p.isActive             // now uses the edited toggle
      };
    });
  
    this.productSvc.bulkAddProducts(payload).subscribe({
      next: () => alert('Products updated!'),
      error: e => alert(`Update failed (${e.status}): ${e.error || e.message}`)
    });
  }
  

}
