import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  @Input() isVisible = false;
  @Input() title = 'Notification';
  @Input() message = '';
  @Output() closePopup = new EventEmitter<void>();

  close() {
    this.isVisible = false;
    this.closePopup.emit();
  }

  onOverlayClick() {
    this.close();
  }
} 