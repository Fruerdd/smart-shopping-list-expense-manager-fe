import {Component, HostListener, OnInit} from '@angular/core';
import { ShoppingListService, ShoppingList } from '@app/services/shopping-list.service';
import { ShoppingListCardComponent } from './shopping-list-card/shopping-list-card.component';
import { SharedWithPopupComponent } from './shared-with-popup/shared-with-popup.component';
import { ShoppingListDetailsComponent } from './shopping-list-details/shopping-list-details.component';
import { NgForOf, AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

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
  shoppingLists$!: Observable<ShoppingList[]>;
  showSharedPopup = false;
  selectedSharedUsers: { name: string; avatar: string }[] = [];
  selectedList: ShoppingList | null = null;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit(): void {
    this.shoppingLists$ = this.shoppingListService.getShoppingLists();
  }

  openSharedPopup(users: { name: string; avatar: string }[]): void {
    this.selectedSharedUsers = users;
    this.showSharedPopup = true;
  }

  closeSharedPopup(): void {
    this.showSharedPopup = false;
  }

  showListDetails(list: ShoppingList): void {
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
}
