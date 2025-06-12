import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShoppingListDTO} from '@app/models/shopping-list.dto';
import {FormsModule} from '@angular/forms';
import {ShoppingListItemDTO} from '@app/models/shopping-list-item.dto';
import {PermissionEnum} from '@app/models/collaborator.dto';
import {AuthService} from '@app/services/auth.service';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {ConfirmationPopupComponent} from '../shared/confirmation-popup.component';

@Component({
  selector: 'app-shopping-list-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatIcon, ConfirmationPopupComponent],
  templateUrl: './shopping-list-details.component.html',
  styleUrls: ['./shopping-list-details.component.css']
})
export class ShoppingListDetailsComponent {
  @Input() list!: ShoppingListDTO;
  @Output() editList = new EventEmitter<ShoppingListDTO>();
  @Output() deleteList = new EventEmitter<string>();
  @Output() updateItem = new EventEmitter<{
    listId: string,
    itemId: string,
    item: ShoppingListItemDTO,
    onError: () => void
  }>();

  private readonly userId: string;
  showDeleteConfirmation = false;

  constructor(private authService: AuthService) {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be logged in');
    }
    this.userId = currentUserId;
  }

  hasEditPermission(): boolean {
    if (this.isOwner()) return true;
    const userCollaborator = this.list.collaborators.find(c => c.userId === this.userId);
    return userCollaborator?.permission === PermissionEnum.EDIT;
  }

  isOwner(): boolean {
    return this.list.ownerId === this.userId;
  }

  toggleItemChecked(item: ShoppingListItemDTO): void {
    const previousState = item.isChecked || false;
    
    item.isChecked = !previousState;
    
    const updatedItem: ShoppingListItemDTO = {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      isChecked: !previousState,
      status: item.status || 'PENDING'
    };

    const onError = () => {
      item.isChecked = previousState;
    };

    this.updateItem.emit({
      listId: this.list.id,
      itemId: item.id,
      item: updatedItem,
      onError
    });
  }

  calculateTotalPrice(): number {
    if (!this.list?.items) {
      return 0;
    }

    return this.list.items.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }

  editShoppingList(): void {
    this.editList.emit(this.list);
  }

  onDeleteList(): void {
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    this.showDeleteConfirmation = false;
    this.deleteList.emit(this.list.id);
  }

  onCancelDelete(): void {
    this.showDeleteConfirmation = false;
  }
}
