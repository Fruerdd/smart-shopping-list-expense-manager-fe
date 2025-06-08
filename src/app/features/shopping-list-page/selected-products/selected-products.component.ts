import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShoppingListItemDTO} from '@app/models/shopping-list-item.dto';
import {MatIconModule} from '@angular/material/icon';
import { SearchEventService } from '@app/services/search-event.service';

@Component({
  selector: 'app-selected-products',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './selected-products.component.html',
  styleUrls: ['./selected-products.component.css']
})
export class SelectedProductsComponent implements OnChanges {
  @Input() selectedProducts: ShoppingListItemDTO[] = [];
  @Input() searchTerm = '';
  @Input() isEditMode = false;
  @Input() preferredStore: string | null = null;
  @Input() listFormValid = false;

  @Output() quantityChange = new EventEmitter<{ id: string, quantity: number }>();
  @Output() removeProduct = new EventEmitter<ShoppingListItemDTO>();
  @Output() saveList = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() changeStore = new EventEmitter<void>();
  @Output() updateProductStore = new EventEmitter<{ productId: string, newStore: string }>();

  constructor(private searchEventService: SearchEventService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preferredStore'] && !changes['preferredStore'].firstChange) {
      const currentStore = changes['preferredStore'].currentValue;
      const previousStore = changes['preferredStore'].previousValue;

      if (currentStore !== previousStore && currentStore) {
        this.switchSelectedItemsToNewStore(currentStore);
      }
    }
    const listChange = changes['selectedProducts'];
  if (listChange && !listChange.firstChange) {
    const prev = listChange.previousValue  as ShoppingListItemDTO[] || [];
    const curr = listChange.currentValue   as ShoppingListItemDTO[] || [];
    const added = curr.filter(c => !prev.some(p => p.id === c.id));

    // ← defer to next macrotask so CD finishes before we fire any HTTP
    setTimeout(() => {
      added.forEach(item =>
        this.searchEventService
          .log({ productId: item.id, searchTerm: this.searchTerm })
          .subscribe({
            next: () => {/* no op */},
            error: e => console.error('search-log failed', e)
          })
      );
    });
  }
}

  private switchSelectedItemsToNewStore(newStore: string): void {
    this.selectedProducts.forEach(product => {
      this.updateProductStore.emit({
        productId: product.id,
        newStore: newStore
      });
    });
  }

  getContainerHeight(): string {
    const baseHeight = 100;
    const itemHeight = 70;
    const maxHeight = 300;
    return `${Math.min(baseHeight + (this.selectedProducts.length * itemHeight), maxHeight)}px`;
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity > 0) {
      this.quantityChange.emit({id: itemId, quantity});
    }
  }

  onRemoveProduct(product: ShoppingListItemDTO): void {
    this.removeProduct.emit(product);
  }

  onSaveList(): void {
    this.saveList.emit();
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }

  getTotalPrice(): number {
    return this.selectedProducts.reduce((total, product) => {
      return total + ((product.price || 0) * (product.quantity || 1));
    }, 0);
  }

  
}
