import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {
  // manual‐entry form
  productsForm!: FormGroup;

  // CSV buffer
  csvProducts: AddProductCsv[] = [];

  // stores + store context
  storeId: string | null = null;
  store: any;
  stores: any[] = [];
  existingProducts: any[] = [];
  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // build the manual form
    this.productsForm = this.fb.group({
      products: this.fb.array([this.createProductGroup()])
    });

    // check route for a preselected store
    this.storeId = this.route.snapshot.paramMap.get('storeId');
    if (this.storeId) {
      this.loadStore(this.storeId);
      this.loadExisting(this.storeId);
      this.preFillStoreId();
    } else {
      // otherwise load all stores for dropdown
      this.http
        .get<any[]>('http://localhost:8080/api/stores')
        .subscribe(data => (this.stores = data));
    }
  }

  // manual form helpers
  get productsArray(): FormArray {
    return this.productsForm.get('products') as FormArray;
  }

  createProductGroup(): FormGroup {
    return this.fb.group({
      storeId: [this.storeId || null, Validators.required],
      productName: ['', Validators.required],
      category: [''],
      description: [''],
      isActive: [true],
      price: [0, [Validators.required, Validators.min(0)]],
      barcode: ['']
    });
  }

  preFillStoreId(): void {
    this.productsArray.controls.forEach(ctrl => {
      ctrl.patchValue({ storeId: this.storeId });
      ctrl.get('storeId')?.disable();
    });
  }

  addProductRow(): void {
    const group = this.createProductGroup();
    if (this.storeId) {
      group.patchValue({ storeId: this.storeId });
      group.get('storeId')?.disable();
    }
    this.productsArray.push(group);
  }

  removeProductRow(i: number): void {
    this.productsArray.removeAt(i);
  }

  onSearch(): void {
    // optional: filter existingProducts or stores
    console.log('search:', this.searchQuery);
  }

  onStoreSelected(id: string): void {
    this.router.navigate(['/admin-page/add-products', id]);
  }

  onSubmit(): void {
    if (!this.productsForm.valid) return;
    // re‐enable storeId fields
    this.productsArray.controls.forEach(c => c.get('storeId')?.enable());
    const payload = this.productsForm.value.products;
    this.http
      .post('http://localhost:8080/api/products/bulk', payload)
      .subscribe({
        next: () => alert('Manual products added'),
        error: e => alert('Error: ' + e.message)
      });
  }

  // CSV upload
  onFileSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const headers = lines.shift()!
        .split(',')
        .map(h => h.trim());

      this.csvProducts = lines.map(line => {
        const cols = line.split(',').map(c => c.trim());
        const obj: any = {};
        headers.forEach((h, i) => (obj[h] = cols[i] || ''));

        return {
          storeId: this.storeId!,
          productName: obj['productName'],
          category: obj['category'],
          description: obj['description'],
          price: parseFloat(obj['price']) || 0,
          barcode: obj['barcode'],
          isActive: obj['isActive']?.toLowerCase() === 'true'
        } as AddProductCsv;
      });
    };
    reader.readAsText(file);
  }

  onSubmitCsv() {
    if (!this.csvProducts.length) return;
    this.http
      .post('http://localhost:8080/api/products/bulk', this.csvProducts)
      .subscribe({
        next: () => {
          alert('CSV products uploaded');
          this.csvProducts = [];
        },
        error: e => alert('CSV upload error: ' + e.message)
      });
  }

  // data loaders
  private loadStore(id: string) {
    this.http
      .get<any>(`http://localhost:8080/api/stores/${id}`)
      .subscribe(s => (this.store = s));
  }

  private loadExisting(id: string) {
    this.http
      .get<any[]>(`http://localhost:8080/api/stores/${id}/products`)
      .subscribe(list => (this.existingProducts = list));
  }
}

// match your AddProductDTO on the backend
interface AddProductCsv {
  storeId: string;
  productName: string;
  category: string;
  description: string;
  price: number;
  barcode: string;
  isActive: boolean;
}
