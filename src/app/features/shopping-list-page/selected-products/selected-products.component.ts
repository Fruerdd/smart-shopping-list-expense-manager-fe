import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ShoppingListItem } from '@app/services/shopping-list-page.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-selected-products',
  templateUrl: './selected-products.component.html',
  styleUrls: ['./selected-products.component.css'],
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatIconModule]
})
export class SelectedProductsComponent {
  @Input() selectedProducts: ShoppingListItem[] = [];
  @Input() isEditMode = false;
  @Input() preferredStore: string | null = null;
  @Input() listFormValid = false;

  @Output() quantityChange = new EventEmitter<{id: string, quantity: number}>();
  @Output() removeProduct = new EventEmitter<ShoppingListItem>();
  @Output() saveList = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() changeStore = new EventEmitter<void>();

  getContainerHeight(): string {
    const baseHeight = 100;
    const itemHeight = 70;
    const maxHeight = 300;

    const calculatedHeight = baseHeight + (this.selectedProducts.length * itemHeight);
    const finalHeight = Math.min(calculatedHeight, maxHeight);

    return `${finalHeight}px`;
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    this.quantityChange.emit({id: itemId, quantity});
  }

  onRemoveProduct(product: ShoppingListItem): void {
    this.removeProduct.emit(product);
  }

  onSaveList(): void {
    this.saveList.emit();
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }
}
