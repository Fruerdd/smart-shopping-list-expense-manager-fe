import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface StoreOption {
  storeName: string;
  storeIcon: string;
}

@Component({
  selector: 'app-store-selection-modal',
  templateUrl: './store-selection-modal.component.html',
  styleUrls: ['./store-selection-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class StoreSelectionModalComponent {
  @Input() show: boolean = false;
  @Input() stores: StoreOption[] = [];
  @Input() preferredStore: string | null = null;
  @Input() isLoading: boolean = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() storeSelected = new EventEmitter<string>();
  @Output() clearStore = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  onClose(): void {
    this.closeModal.emit();
  }

  onStoreSelect(storeName: string): void {
    this.storeSelected.emit(storeName);
  }

  onClearStore(): void {
    this.clearStore.emit();
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
