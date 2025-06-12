import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UserDTO, UsersService } from '@app/services/users.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HtmlSnackComponent } from '@app/html-snack/html-snack.component';

@Component({
  selector: 'app-edit-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css']
})
export class EditUsersComponent implements OnInit {
  users: UserDTO[] = [];
  filter = '';                       
  userTypes: Array<'ALL' | 'USER' | 'ADMIN'> = ['ALL', 'USER', 'ADMIN'];
  selectedRole: 'ALL' | 'USER' | 'ADMIN' = 'ALL'; 

  pageSize = 10;
  currentPage = 0;

  constructor(
    private usersSvc: UsersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.usersSvc.getUsers().subscribe(list => {
      this.users = list.map(u => ({
        ...u,
        userType: (u.userType as 'USER' | 'ADMIN') ?? 'USER'
      }));
      this.resetPage();
    });
  }

  private get filteredUsers(): UserDTO[] {
    const term = this.filter.trim().toLowerCase();
    return this.users.filter(u => {
      if (this.selectedRole !== 'ALL' && u.userType !== this.selectedRole) {
        return false;
      }
      if (!term) {
        return true;
      }
      return u.name.toLowerCase().includes(term)
          || u.email.toLowerCase().includes(term);
    });
  }

  get pagedUsers(): UserDTO[] {
    const filtered = this.filteredUsers;
    const start = this.currentPage * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  onFilterChange() {
    this.resetPage();
  }

  resetPage() {
    this.currentPage = 0;
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  deleteUser(u: UserDTO) {
    u.isActive = false;
  }

  saveAll() {
    this.usersSvc.bulkUpdateUsers(this.users).subscribe({
      next: () => this.showNotification(
        `<b>Users updated</b> successfully!`,
        3000
      ),
      error: e => this.showNotification(
        `Save failed:<br><i>${e.message || e.status}</i>`,
        5000
      )
    });
  }

  private showNotification(message: string, duration = 3000) {
    this.snackBar.openFromComponent(HtmlSnackComponent, {
      data: { message },
      duration
    });
  }
}
