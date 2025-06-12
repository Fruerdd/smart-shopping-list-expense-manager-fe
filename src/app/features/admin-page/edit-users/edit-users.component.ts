import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UserDTO, UsersService } from '@app/services/users.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HtmlSnackComponent } from '@app/html-snack/html-snack.component' 

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
  userTypes: Array<'USER' | 'ADMIN'> = ['USER', 'ADMIN'];

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
    });
  }

  get filteredUsers() {
    const term = this.filter.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
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
