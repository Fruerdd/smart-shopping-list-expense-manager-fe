import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {StoreDTO} from '@app/models/store.dto';

@Component({
  selector: 'app-store-selection-modal',
  templateUrl: './store-selection-modal.component.html',
  styleUrls: ['./store-selection-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class StoreSelectionModalComponent {
  @Input() show: boolean = false;
  @Input() stores: StoreDTO[] = [];
  @Input() preferredStore: string | null = null;
  @Input() isLoading: boolean = false;
  @Input() currentStore: string | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() storeSelected = new EventEmitter<StoreDTO>();
  @Output() clearStore = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onStoreSelect(store: StoreDTO): void {
    this.storeSelected.emit(store);
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
