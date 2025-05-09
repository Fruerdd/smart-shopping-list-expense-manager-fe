import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';

import { UsersService, UserDTO } from '@app/services/users.service';

@Component({
  selector: 'app-edit-users',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css']
})
export class EditUsersComponent implements OnInit {
  users: UserDTO[] = [];
  filter = '';
  userTypes: Array<'USER'|'ADMIN'> = ['USER','ADMIN'];

  constructor(private usersSvc: UsersService) {}

  ngOnInit() {
    this.usersSvc.getUsers()
      .subscribe(list => this.users = list);
  }

  /** filtered by name/email */
  get filteredUsers() {
    const term = this.filter.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(u =>
      u.name.toLowerCase().includes(term)
      || u.email.toLowerCase().includes(term)
    );
  }

  /** just set isActive=false */
  deleteUser(u: UserDTO) {
    u.isActive = false;
  }

  saveAll() {
    this.usersSvc.bulkUpdateUsers(this.users)
      .subscribe({
        next: () => alert('Users updated successfully'),
        error: e => alert(`Save failed: ${e.message || e.status}`)
      });
  }
}
