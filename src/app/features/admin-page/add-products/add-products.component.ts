import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {
  productsForm!: FormGroup;
  // If a store is preselected from the route parameter:
  storeId: string | null = null;
  // Store details for a preselected store:
  store: any;
  // List of stores (if no store is preselected):
  stores: any[] = [];  
  existingProducts: any[] = [];
  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router  // Import Router for navigation
  ) {}

  ngOnInit(): void {
    this.productsForm = this.fb.group({
      products: this.fb.array([this.createProductGroup()])
    });

    // Check if a storeId is in the URL:
    this.storeId = this.route.snapshot.paramMap.get('storeId');

    if (this.storeId) {
      // Preselected store: fetch its details
      this.http.get<any>(`http://localhost:8080/api/stores/${this.storeId}`)
        .subscribe(data => this.store = data);

      // Fetch existing products for this store
      this.http.get<any[]>(`http://localhost:8080/api/stores/${this.storeId}/products`)
        .subscribe(data => this.existingProducts = data);

      // Pre-fill the storeId in the form and disable changes
      this.preFillStoreId();
    } else {
      // No preselected store: fetch list of stores for selection
      this.http.get<any[]>('http://localhost:8080/api/stores')
        .subscribe(data => this.stores = data);
    }
  }

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
    this.productsArray.controls.forEach(control => {
      control.patchValue({ storeId: this.storeId });
      control.get('storeId')?.disable();
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

  removeProductRow(index: number): void {
    this.productsArray.removeAt(index);
  }

  onSearch(): void {
    console.log('Search query:', this.searchQuery);
    // Implement filtering logic if necessary
  }

  // This method is triggered when a user selects a store from the dropdown.
  onStoreSelected(selectedStoreId: string): void {
    if (selectedStoreId) {
      // Navigate to the route with the storeId parameter
      this.router.navigate(['/admin-page/add-products', selectedStoreId]);
    }
  }

  onSubmit(): void {
    if (this.productsForm.valid) {
      // Re-enable storeId controls before submission
      this.productsArray.controls.forEach(control => {
        control.get('storeId')?.enable();
      });
      const productData = this.productsForm.value.products;
      console.log('Submitting products:', productData);
      this.http.post('http://localhost:8080/api/products/bulk', productData)
        .subscribe({
          next: () => alert('Products added successfully'),
          error: (err) => alert('Error: ' + err.message)
        });
    }
  }
}
