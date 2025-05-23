import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import { ShoppingListService } from '@app/services/shopping-list.service';
import { ShoppingListCardComponent } from './shopping-list-card/shopping-list-card.component';
import { SharedWithPopupComponent } from './shared-with-popup/shared-with-popup.component';
import { ShoppingListDetailsComponent } from './shopping-list-details/shopping-list-details.component';
import { NgForOf, AsyncPipe, NgIf } from '@angular/common';
import { Observable, tap, catchError, of } from 'rxjs';
import { ShoppingListDTO } from '@app/models/shopping-list.dto';
import { AuthService } from '@app/services/auth.service';
import { CollaboratorDTO } from '@app/models/collaborator.dto';
import { ShoppingListItemDTO } from '@app/models/shopping-list-item.dto';

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

  updateItem(event: {listId: string, itemId: string, item: ShoppingListItemDTO, onError: () => void}): void {
    this.shoppingListService.updateShoppingListItem(
      this.userId,
      event.listId,
      event.itemId,
      event.item
    ).subscribe({
      next: (updatedItem) => {
        if (this.selectedList) {
          const itemToUpdate = this.selectedList.items.find(i => i.id === event.itemId);
          if (itemToUpdate) {
            itemToUpdate.isChecked = event.item.isChecked;
          }
        }
      },
      error: (error) => {
        console.error('Failed to update item:', error);
        event.onError();
      }
    });
  }

  openSharedPopup(collaborators: CollaboratorDTO[]): void {
    this.selectedSharedUsers = collaborators;
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
}
