import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollaboratorDTO, PermissionEnum } from '@app/models/collaborator.dto';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-shared-with-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule],
  templateUrl: './shared-with-popup.component.html',
  styleUrls: ['./shared-with-popup.component.css']
})
export class SharedWithPopupComponent {
  @Input() collaborators: CollaboratorDTO[] = [];
  @Input() isOwner: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() removeCollaborator = new EventEmitter<string>();
  @Output() updatePermission = new EventEmitter<{collaboratorId: string, permission: PermissionEnum}>();

  protected readonly PermissionEnum = PermissionEnum;

  closePopup(): void {
    this.close.emit();
  }

  onRemoveCollaborator(collaboratorId: string): void {
    this.removeCollaborator.emit(collaboratorId);
  }

  onUpdatePermission(collaboratorId: string, permission: PermissionEnum): void {
    this.updatePermission.emit({ collaboratorId, permission });
  }
}
