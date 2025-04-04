import { Component, EventEmitter, Input, Output } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { SharedUser } from '@app/services/shopping-list.service';

@Component({
  selector: 'app-shared-with-popup',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './shared-with-popup.component.html',
  styleUrls: ['./shared-with-popup.component.css']
})
export class SharedWithPopupComponent {
  @Input() sharedWith: SharedUser[] = [];
  @Output() close = new EventEmitter<void>();

  closePopup(): void {
    this.close.emit();
  }
}
