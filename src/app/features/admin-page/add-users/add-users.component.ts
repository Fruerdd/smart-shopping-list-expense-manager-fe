import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

import {EMPTY} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {UserDTO, UsersService} from '@app/services/users.service';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.css']
})
export class AddUsersComponent {
  usersForm: FormGroup;
  csvHeaders: string[] = [];
  csvUsers: UserDTO[] = [];
  isCsvPreviewVisible = false;

  constructor(
    private fb: FormBuilder,
    private usersSvc: UsersService
  ) {
    this.usersForm = this.fb.group({
      users: this.fb.array([this.createUserGroup()])
    });
  }

  get users(): FormArray {
    return this.usersForm.get('users') as FormArray;
  }

  private createUserGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phoneNumber: [''],
      referralCode: [''],
      promoCode: [''],
      bonusPoints: [0],
      deviceInfo: [''],
      location: [''],
      userType: ['user'],
      isActive: [true],
      reviewScore: [0],
      reviewContext: ['']
    });
  }

  addUser() {
    this.users.push(this.createUserGroup());
  }

  removeUser(i: number) {
    this.users.removeAt(i);
  }

  onSubmit() {
    if (this.usersForm.invalid) {
      return;
    }
    const payload: UserDTO[] = this.usersForm.value.users;
    this.usersSvc.bulkAddUsers(payload).subscribe({
      next: () => alert('Users added successfully'),
      error: e => alert(`Error: ${e.message || e.status}`)
    });
  }

  onCsvFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const lines = (reader.result as string)
        .split(/\r?\n/)
        .filter(l => l.trim());
      this.csvHeaders = lines.shift()!
        .split(',').map(h => h.trim());
      this.csvUsers = lines.map(line => {
        const cols = line.split(',').map(c => c.trim());
        const obj: any = {};
        this.csvHeaders.forEach((h, idx) => {
          let v: any = cols[idx] ?? '';
          if (h === 'bonusPoints' || h === 'reviewScore') {
            v = Number(v) || 0;
          } else if (h === 'isActive') {
            v = v.toLowerCase() === 'true' || v === '1';
          }
          obj[h] = v;
        });
        obj.userType = obj.userType || 'user';
        return obj as UserDTO;
      });
      this.isCsvPreviewVisible = true;
    };
    reader.readAsText(input.files[0]);
  }

  /**
   * 1) GET existing users
   * 2) Filter out any CSV-email that already exists
   * 3) POST only the truly new users
   */
  uploadCsv() {
    if (!this.csvUsers.length) {
      return;
    }

    this.usersSvc.getUsers().pipe(
      map(existing => {
        const seen = new Set(existing.map(u => u.email));
        return this.csvUsers.filter(u => !seen.has(u.email));
      }),
      switchMap(newUsers => {
        if (!newUsers.length) {
          alert('No new users to add');
          return EMPTY;
        }
        return this.usersSvc.bulkAddUsers(newUsers);
      })
    ).subscribe({
      next: () => {
        alert('CSV users uploaded successfully');
        // reset preview & manual form:
        this.csvUsers = [];
        this.csvHeaders = [];
        this.isCsvPreviewVisible = false;
        this.users.clear();
        this.users.push(this.createUserGroup());
      },
      error: err => {
        console.error('CSV upload error:', err);
        alert(`CSV upload error: ${err.status} – ${err.error?.message || err.message}`);
      }
    });
  }
}
