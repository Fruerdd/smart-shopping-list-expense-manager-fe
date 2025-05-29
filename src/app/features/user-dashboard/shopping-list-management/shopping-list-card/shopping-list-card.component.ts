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
  @Output() viewSharedUsers = new EventEmitter<{collaborators: CollaboratorDTO[], listId: string, isOwner: boolean}>();
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

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    
    // If it's already a full URL or base64, return as is
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    
    // If it's a relative path, prepend the API base URL
    if (avatarPath.startsWith('/uploads/')) {
      return `http://localhost:8080${avatarPath}`;
    }
    
    return avatarPath;
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
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

  onViewSharedUsers(listId: string, isOwner: boolean): void {
    this.viewSharedUsers.emit({
      collaborators: this.shoppingList.collaborators,
      listId,
      isOwner
    });
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
