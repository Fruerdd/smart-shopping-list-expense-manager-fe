import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';

import {StoreDetailsDTO, StoreDTO, StoreService, StoreUpsertPayload} from '@app/services/store.service';

@Component({
  selector: 'app-add-edit-store',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './add-edit-store.component.html',
  styleUrls: ['./add-edit-store.component.css']
})
export class AddEditStoreComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(StoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // — Add / Create form
  storeForm!: FormGroup;
  storeId: string | null = null;

  // — Edit existing
  stores: StoreDTO[] = [];
  selectedStoreId = '';
  editForm!: FormGroup;

  ngOnInit(): void {
    // 1) Initialize “Add Store” form
    this.storeId = this.route.snapshot.paramMap.get('id');
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      icon: [''],
      location: [''],
      contact: [''],
      isActive: [true]
    });

    if (this.storeId) {
      this.svc.getStore(this.storeId)
        .subscribe((d: StoreDetailsDTO) => {
          this.storeForm.patchValue({
            name: d.name,
            icon: d.icon,
            location: d.location,
            contact: d.contact,
            isActive: true
          });
        });
    }

    // 2) Load stores for the edit selector
    this.svc.getStores().subscribe(list => this.stores = list);

    // 3) Initialize “Edit Store” form
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      icon: [''],
      location: [''],
      contact: [''],
      isActive: [true]
    });
  }

  // Create or update on top form
  onSubmit(): void {
    if (this.storeForm.invalid) return;

    const payload: StoreUpsertPayload = this.storeForm.value;
    const obs = this.storeId
      ? this.svc.updateStore(this.storeId, payload)
      : this.svc.createStore(payload);

    obs.subscribe(() => this.router.navigate(['/admin-page/product-analytics']));
  }

  // When user selects a store to edit
  onStoreSelect(storeId: string): void {
    if (!storeId) {
      this.selectedStoreId = '';
      this.editForm.reset();
      return;
    }

    this.selectedStoreId = storeId;
    this.svc.getStore(storeId)
      .subscribe((d: StoreDetailsDTO) => {
        this.editForm.patchValue({
          name: d.name,
          icon: d.icon,
          location: d.location,
          contact: d.contact,
          isActive: true
        });
      });
  }

  // Submit edited store
  onEditSubmit(): void {
    if (this.editForm.invalid || !this.selectedStoreId) return;

    this.svc.updateStore(this.selectedStoreId, this.editForm.value)
      .subscribe(() => alert('Store updated!'));
  }
}
