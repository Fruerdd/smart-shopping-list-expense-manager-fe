import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ShoppingListDTO } from '@app/models/shopping-list.dto';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CollaboratorDTO, PermissionEnum } from '@app/models/collaborator.dto';
import { AuthService } from '@app/services/auth.service';
import { UserProfileService } from '@app/services/user-profile.service';
import { CommonModule } from '@angular/common';
import { ImageUrlService } from '@app/services/image-url.service';

@Component({
  selector: 'app-shopping-list-card',
  standalone: true,
  imports: [MatIcon, MatIconModule, CommonModule],
  templateUrl: './shopping-list-card.component.html',
  styleUrls: ['./shopping-list-card.component.css']
})
export class ShoppingListCardComponent implements OnInit {
  @Input() shoppingList!: ShoppingListDTO;
  @Output() viewSharedUsers = new EventEmitter<{collaborators: CollaboratorDTO[], listId: string, isOwner: boolean}>();
  @Output() viewList = new EventEmitter<ShoppingListDTO>();
  @Output() markListAsDone = new EventEmitter<string>();

  protected userId: string;
  ownerAvatarUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private imageUrlService: ImageUrlService
  ) {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be logged in');
    }
    this.userId = currentUserId;
  }

  ngOnInit() {
    // Fetch owner avatar separately if not available in shopping list
    if (!this.shoppingList.ownerAvatar && this.shoppingList.ownerId) {
      this.loadOwnerAvatar();
    } else {
      this.ownerAvatarUrl = this.getFullImageUrl(this.shoppingList.ownerAvatar);
    }
  }

  private loadOwnerAvatar() {
    this.userProfileService.getUserProfileById(this.shoppingList.ownerId).subscribe({
      next: (ownerProfile) => {
        this.ownerAvatarUrl = this.getFullImageUrl(ownerProfile.avatar);
      },
      error: (error) => {
        console.error('Error loading owner avatar:', error);
        this.ownerAvatarUrl = null; // Will fallback to default avatar
      }
    });
  }

  getOwnerAvatarUrl(): string {
    return this.ownerAvatarUrl || '/assets/images/avatar.png';
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    return this.imageUrlService.getFullImageUrl(avatarPath);
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
