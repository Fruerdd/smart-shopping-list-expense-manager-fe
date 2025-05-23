import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ShoppingListDTO } from '@app/models/shopping-list.dto';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CollaboratorDTO, PermissionEnum } from '@app/models/collaborator.dto';
import { AuthService } from '@app/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-list-card',
  standalone: true,
  imports: [MatIcon, MatIconModule, CommonModule],
  templateUrl: './shopping-list-card.component.html',
  styleUrls: ['./shopping-list-card.component.css']
})
export class ShoppingListCardComponent {
  @Input() shoppingList!: ShoppingListDTO;
  @Output() viewSharedUsers = new EventEmitter<void>();
  @Output() viewList = new EventEmitter<ShoppingListDTO>();
  @Output() markListAsDone = new EventEmitter<string>();

  protected userId: string;

  constructor(private authService: AuthService) {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be logged in');
    }
    this.userId = currentUserId;
  }

  hasEditPermission(): boolean {
    // Owner always has edit permission
    if (this.shoppingList.ownerId === this.userId) {
      return true;
    }

    // Check collaborator permissions
    const userCollaborator = this.shoppingList.collaborators.find(c => c.userId === this.userId);
    return userCollaborator?.permission === PermissionEnum.EDIT;
  }

  onViewSharedUsers(): void {
    this.viewSharedUsers.emit();
  }

  onViewList(): void {
    this.viewList.emit(this.shoppingList);
  }

  onMarkAsDone(event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to mark this list as done? This will archive the list.')) {
      this.markListAsDone.emit(this.shoppingList.id);
    }
  }
}
