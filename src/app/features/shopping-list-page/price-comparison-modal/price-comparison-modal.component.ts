import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ShoppingListItemDTO } from '@app/models/shopping-list-item.dto';
import { StoreItemDTO } from '@app/models/store-item.dto';

@Component({
  selector: 'app-price-comparison-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './price-comparison-modal.component.html',
  styleUrls: ['./price-comparison-modal.component.css']
})
export class PriceComparisonModalComponent {
  @Input() show: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() storeComparisons: StoreItemDTO[] = [];
  @Input() selectedProduct: ShoppingListItemDTO | null = null;
  @Input() preferredStore: string | null = null;
  @Input() product: ShoppingListItemDTO | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() storeSelected = new EventEmitter<StoreItemDTO>();

  constructor(private sanitizer: DomSanitizer) {}

  onClose(): void {
    this.closeModal.emit();
  }

  onStoreSelect(store: StoreItemDTO): void {
    this.storeSelected.emit(store);
  }

  getSafeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
