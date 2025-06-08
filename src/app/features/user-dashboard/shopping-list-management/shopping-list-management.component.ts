import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {ShoppingListService} from '@app/services/shopping-list.service';
import {ShoppingListCardComponent} from './shopping-list-card/shopping-list-card.component';
import {SharedWithPopupComponent} from './shared-with-popup/shared-with-popup.component';
import {ShoppingListDetailsComponent} from './shopping-list-details/shopping-list-details.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {catchError, Observable, of, tap} from 'rxjs';
import {ShoppingListDTO} from '@app/models/shopping-list.dto';
import {AuthService} from '@app/services/auth.service';
import {CollaboratorDTO, PermissionEnum} from '@app/models/collaborator.dto';
import {ShoppingListItemDTO} from '@app/models/shopping-list-item.dto';

@Component({
  selector: 'app-shopping-list-management',
  templateUrl: './shopping-list-management.component.html',
  standalone: true,
  imports: [
    ShoppingListCardComponent,
    SharedWithPopupComponent,
    ShoppingListDetailsComponent,
    NgForOf,
    AsyncPipe,
    NgIf
  ],
  styleUrls: ['./shopping-list-management.component.css']
})
export class ShoppingListManagementComponent implements OnInit {
  shoppingLists$!: Observable<ShoppingListDTO[]>;
  showSharedPopup = false;
  selectedSharedUsers: CollaboratorDTO[] = [];
  selectedList: ShoppingListDTO | null = null;
  userId: string;
  isListOwner = false;
  private currentListId: string | null = null;

  @Output() editList = new EventEmitter<ShoppingListDTO>();

  editShoppingList(list: ShoppingListDTO): void {
    this.editList.emit(list);
  }

  @Output() createAList = new EventEmitter<void>();

  createShoppingList(): void {
    this.createAList.emit();
  }

  constructor(
    private shoppingListService: ShoppingListService,
    private authService: AuthService
  ) {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }
    this.userId = userId;
  }

  ngOnInit(): void {
    this.loadShoppingLists();
  }

  private loadShoppingLists(): void {
    this.shoppingLists$ = this.shoppingListService.getShoppingLists(this.userId).pipe(
      tap(lists => {
        if (this.selectedList) {
          const updatedList = lists.find(l => l.id === this.selectedList?.id);
          if (updatedList) {
            this.selectedList = updatedList;
          } else {
            console.warn('Selected list no longer exists:', this.selectedList.id);
            this.closeListDetails();
          }
        }
      }),
      catchError(error => {
        console.error('Error loading shopping lists:', error);
        return of([]);
      })
    );
  }

  updateItem(event: { listId: string, itemId: string, item: ShoppingListItemDTO, onError: () => void }): void {
    this.shoppingListService.updateShoppingListItem(
      this.userId,
      event.listId,
      event.itemId,
      event.item
    ).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Failed to update item:', error);
        event.onError();
      }
    });
  }

  openSharedPopup(collaborators: CollaboratorDTO[], listId: string, isOwner: boolean): void {
    this.selectedSharedUsers = collaborators;
    this.currentListId = listId;
    this.isListOwner = isOwner;
    this.showSharedPopup = true;
  }

  closeSharedPopup(): void {
    this.showSharedPopup = false;
  }

  showListDetails(list: ShoppingListDTO): void {
    this.selectedList = list;
  }

  closeListDetails(): void {
    this.selectedList = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const detailsElement = document.querySelector('.shopping-list-details');
    const viewButtons = document.querySelectorAll('.view-button');

    if (
      detailsElement && detailsElement.contains(event.target as Node) ||
      Array.from(viewButtons).some(button => button.contains(event.target as Node))
    ) {
      return;
    }

    this.closeListDetails();
  }

  deleteShoppingList(listId: string): void {
    this.shoppingListService.deleteShoppingList(this.userId, listId).subscribe({
      next: () => {
        this.selectedList = null;
        this.loadShoppingLists();
      },
      error: () => this.loadShoppingLists()
    });
  }

  onUpdatePermission(event: { collaboratorId: string, permission: PermissionEnum }): void {
    if (!this.currentListId) return;

    const collaborator: CollaboratorDTO = {
      userId: event.collaboratorId,
      permission: event.permission
    };

    this.shoppingListService.updateCollaborator(this.userId, this.currentListId, event.collaboratorId, collaborator)
      .subscribe({
        next: () => {
          this.selectedSharedUsers = this.selectedSharedUsers.map(user =>
            user.userId === event.collaboratorId
              ? {...user, permission: event.permission}
              : user
          );
          this.loadShoppingLists();
        },
        error: (error) => {
          console.error('Error updating collaborator:', error);
        }
      });
  }

  onRemoveCollaborator(collaboratorId: string): void {
    if (!this.currentListId) return;

    this.shoppingListService.removeCollaborator(this.userId, this.currentListId, collaboratorId)
      .subscribe({
        next: () => {
          this.selectedSharedUsers = this.selectedSharedUsers.filter(user => user.userId !== collaboratorId);
          this.loadShoppingLists();
        },
        error: (error) => {
          console.error('Error removing collaborator:', error);
        }
      });
  }
}
