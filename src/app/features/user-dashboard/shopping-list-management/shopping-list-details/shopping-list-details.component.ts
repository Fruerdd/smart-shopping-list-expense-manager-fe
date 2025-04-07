import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { ShoppingList } from '@app/services/shopping-list.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-shopping-list-details',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormsModule],
  templateUrl: './shopping-list-details.component.html',
  styleUrls: ['./shopping-list-details.component.css']
})
export class ShoppingListDetailsComponent {
  @Input() list!: ShoppingList;
  @Output() editList = new EventEmitter<ShoppingList>();

  toggleItemChecked(item: any): void {
    item.checked = !item.checked;
  }

  editShoppingList(): void {
    this.editList.emit(this.list);
  }

}
