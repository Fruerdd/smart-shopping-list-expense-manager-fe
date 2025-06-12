// add-products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StoreDetailsDTO,
  StoreDTO,
  StorePriceDTO,
  StoreService
} from '@app/services/store.service';
import { AddProductPayload, ProductService } from '@app/services/product.service';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HtmlSnackComponent } from '@app/html-snack/html-snack.component'; // adjust path as needed

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {
  productsForm!: FormGroup;
  csvProducts: AddProductPayload[] = [];

  storeId: string | null = null;
  store: StoreDetailsDTO | null = null;
  stores: StoreDTO[] = [];
  existingProducts: StorePriceDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storeSvc: StoreService,
    private productSvc: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productsForm = this.fb.group({
      products: this.fb.array([this.createProductGroup()])
    });

    this.storeSvc.getStores().subscribe(list => this.stores = list);

    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;
        this.loadStore(id);
        this.loadExisting(id);
        this.patchStoreIdToForm(id);
      } else {
        this.storeId = null;
        this.store = null;
        this.existingProducts = [];
      }
    });
  }

  get productsArray(): FormArray {
    return this.productsForm.get('products') as FormArray;
  }

  private createProductGroup(): FormGroup {
    return this.fb.group({
      storeId: [this.storeId, Validators.required],
      productName: ['', Validators.required],
      category: [''],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      barcode: [''],
      isActive: [true]
    });
  }

  private patchStoreIdToForm(storeId: string) {
    this.productsArray.controls.forEach(ctrl =>
      ctrl.patchValue({ storeId })
    );
  }

  addProductRow(): void {
    const group = this.createProductGroup();
    if (this.storeId) {
      group.patchValue({ storeId: this.storeId });
    }
    this.productsArray.push(group);
  }

  removeProductRow(i: number): void {
    this.productsArray.removeAt(i);
  }

  onStoreSelected(id: string): void {
    if (!id) {
      this.router.navigate(['/admin-page/add-products']);
    } else {
      this.router.navigate(['/admin-page/add-products', id]);
    }
  }

  onSubmit(): void {
    if (!this.productsForm.valid) return;
    const payload: AddProductPayload[] = this.productsForm.value.products;

    this.productSvc.bulkAddProducts(payload).subscribe({
      next: () => {
        this.showNotification(
          `<b>Manual products added</b> successfully!`,
          3000
        );
        this.productsArray.clear();
        this.productsArray.push(this.createProductGroup());
      },
      error: e => {
        this.showNotification(
          `Error: <i>${e.message}</i>`,
          5000
        );
      }
    });
  }

  onFileSelected(evt: Event) {
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
        this.showNotification(
          `<b>CSV products uploaded</b> successfully!`,
          3000
        );
        this.csvProducts = [];
      },
      error: e => {
        this.showNotification(
          `CSV upload error:<br>${e.message}`,
          5000
        );
      }
    });
  }

  private loadStore(id: string) {
    this.storeSvc.getStore(id).subscribe(s => this.store = s);
  }

  private loadExisting(id: string) {
    this.storeSvc.getStoreProducts(id).subscribe(list => this.existingProducts = list);
  }

  private showNotification(message: string, duration = 3000) {
    this.snackBar.openFromComponent(HtmlSnackComponent, {
      data: { message },
      duration
    });
  }
}
