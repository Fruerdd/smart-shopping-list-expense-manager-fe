import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  StoreDetailsDTO,
  StoreDTO,
  StoreService,
  StoreUpsertPayload
} from '@app/services/store.service';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HtmlSnackComponent } from '@app/html-snack/html-snack.component'; 

@Component({
  selector: 'app-add-edit-store',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatSnackBarModule

  ],
  templateUrl: './add-edit-store.component.html',
  styleUrls: ['./add-edit-store.component.css']
})
export class AddEditStoreComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(StoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  storeForm!: FormGroup;
  storeId: string | null = null;

  stores: StoreDTO[] = [];
  selectedStoreId = '';
  editForm!: FormGroup;

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('id');
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      icon: [''],
      location: [''],
      contact: [''],
      isActive: [true]
    });

    if (this.storeId) {
      this.svc.getStore(this.storeId).subscribe((d: StoreDetailsDTO) => {
        this.storeForm.patchValue({
          name: d.name,
          icon: d.icon,
          location: d.location,
          contact: d.contact
        });
      });
    }

    this.svc.getStores().subscribe(list => (this.stores = list));

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      icon: [''],
      location: [''],
      contact: [''],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.storeForm.invalid) return;

    const payload: StoreUpsertPayload = this.storeForm.value;
    const obs = this.storeId
      ? this.svc.updateStore(this.storeId, payload)
      : this.svc.createStore(payload);

    obs.subscribe({
      next: () => {
        this.showNotification(
          this.storeId
            ? `<b>Store updated</b> successfully!`
            : `<b>Store created</b> successfully!`,
          3000
        );
        this.router.navigate(['/admin-page/product-analytics']);
      },
      error: e => {
        this.showNotification(
          `Error (${e.status || ''}):<br>${e.message || 'Unknown error'}`,
          5000
        );
      }
    });
  }

  onStoreSelect(storeId: string): void {
    if (!storeId) {
      this.selectedStoreId = '';
      this.editForm.reset();
      return;
    }

    this.selectedStoreId = storeId;
    this.svc.getStore(storeId).subscribe((d: StoreDetailsDTO) => {
      this.editForm.patchValue({
        name: d.name,
        icon: d.icon,
        location: d.location,
        contact: d.contact
      });
    });
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || !this.selectedStoreId) return;

    this.svc.updateStore(this.selectedStoreId, this.editForm.value).subscribe({
      next: () =>
        this.showNotification(
          `<b>Store updated</b> successfully!`,
          3000
        ),
      error: e =>
        this.showNotification(
          `Error (${e.status || ''}):<br>${e.message || 'Unknown error'}`,
          5000
        )
    });
  }

  private showNotification(message: string, duration = 3000) {
    this.snackBar.openFromComponent(HtmlSnackComponent, {
      data: { message },
      duration
    });
  }
}
