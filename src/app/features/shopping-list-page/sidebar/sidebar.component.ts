import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {SidebarCategory} from '@app/services/shopping-list-page.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, MatIcon, MatIconModule],
  templateUrl: './sidebar.component.html',
  standalone: true,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() categories: SidebarCategory[] = [];
  @Output() categorySelected = new EventEmitter<string>();

  selectedCategoryId: string = 'default';

  toggleCategory(category: SidebarCategory): void {
    if (this.selectedCategoryId === category.id) {
      this.selectedCategoryId = 'default';
      this.categorySelected.emit(this.selectedCategoryId);
    } else {
      this.selectedCategoryId = category.id;
      this.categorySelected.emit(category.id);
    }
  }

}
