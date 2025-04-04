import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ShoppingList } from '@app/services/shopping-list.service';
import { NgIf } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import {MatIcon, MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-shopping-list-card',
  templateUrl: './shopping-list-card.component.html',
  standalone: true,
  imports: [NgIf, NgOptimizedImage, MatIcon, MatIconModule],
  styleUrls: ['./shopping-list-card.component.css']
})
export class ShoppingListCardComponent {
  @Input() shoppingList!: ShoppingList;
  @Output() viewSharedUsers = new EventEmitter<void>();
  @Output() viewList = new EventEmitter<void>();

  onInfoClick(): void {
    this.viewSharedUsers.emit();
  }

  onViewListClick(): void {
    this.viewList.emit();
  }
}
