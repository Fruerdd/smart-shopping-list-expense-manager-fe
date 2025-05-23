import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ShoppingListDTO } from '@app/models/shopping-list.dto';
import {FormsModule} from '@angular/forms';
import { ShoppingListItemDTO } from '@app/models/shopping-list-item.dto';
import { PermissionEnum } from '@app/models/collaborator.dto';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-shopping-list-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-list-details.component.html',
  styleUrls: ['./shopping-list-details.component.css']
})
export class ShoppingListDetailsComponent {
  @Input() list!: ShoppingListDTO;
  @Output() editList = new EventEmitter<ShoppingListDTO>();
  @Output() deleteList = new EventEmitter<string>();
  @Output() updateItem = new EventEmitter<{listId: string, itemId: string, item: ShoppingListItemDTO, onError: () => void}>();

  private userId: string;

  constructor(private authService: AuthService) {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be logged in');
    }
    this.userId = currentUserId;
  }

  hasEditPermission(): boolean {
    if (this.list.ownerId === this.userId) return true;
    const userCollaborator = this.list.collaborators.find(c => c.userId === this.userId);
    return userCollaborator?.permission === PermissionEnum.EDIT;
  }

  isOwner(): boolean {
    return this.list.ownerId === this.userId;
  }

  toggleItemChecked(item: ShoppingListItemDTO): void {
    const previousState = item.isChecked;
    
    // Create minimal update payload
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
    console.log('Delete button clicked for list:', this.list.id);
    if (confirm('Are you sure you want to delete this list?')) {
      console.log('Delete confirmed, emitting event');
      this.deleteList.emit(this.list.id);
    }
  }
}
