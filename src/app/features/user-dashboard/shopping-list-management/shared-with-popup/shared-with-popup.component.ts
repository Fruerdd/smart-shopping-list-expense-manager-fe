import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollaboratorDTO } from '@app/models/collaborator.dto';

@Component({
  selector: 'app-shared-with-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-with-popup.component.html',
  styleUrls: ['./shared-with-popup.component.css']
})
export class SharedWithPopupComponent {
  @Input() collaborators: CollaboratorDTO[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() removeCollaborator = new EventEmitter<string>();

  closePopup(): void {
    this.close.emit();
  }

  onRemoveCollaborator(collaboratorId: string): void {
    this.removeCollaborator.emit(collaboratorId);
  }
}
