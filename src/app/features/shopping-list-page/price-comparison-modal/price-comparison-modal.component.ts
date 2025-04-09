import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ShoppingListItem, StoreItem } from '@app/services/shopping-list-page.service';

@Component({
  selector: 'app-price-comparison-modal',
  templateUrl: './price-comparison-modal.component.html',
  styleUrls: ['./price-comparison-modal.component.css'],
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatIconModule]
})
export class PriceComparisonModalComponent {
  @Input() show: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() storeComparisons: StoreItem[] = [];
  @Input() selectedProduct: ShoppingListItem | null = null;
  @Input() preferredStore: string | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() storeSelected = new EventEmitter<StoreItem>();

  constructor(private sanitizer: DomSanitizer) {}

  onClose(): void {
    this.closeModal.emit();
  }

  onStoreSelect(store: StoreItem): void {
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
