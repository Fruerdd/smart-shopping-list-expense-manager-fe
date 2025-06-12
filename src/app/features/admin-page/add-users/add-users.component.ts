import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray, FormBuilder, FormGroup,
  FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { EMPTY } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { UserDTO, UsersService } from '@app/services/users.service';
import { MatSnackBar, MatSnackBarModule, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-html-snack',
  standalone: true,
  imports: [CommonModule],
  template: `<div [innerHTML]="data.message"></div>`,
  styles: [`div { font-size: 14px; }`]
})
export class HtmlSnackComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {}
}

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
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
    private usersSvc: UsersService,
    private snackBar: MatSnackBar    
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
      next: () => {
        this.showNotification(
          '<b>Users added</b> successfully!',
          3000
        );
      },
      error: e => {
        this.showNotification(
          `Error: <i>${e.message || e.status}</i>`,
          5000
        );
      }
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
          this.showNotification(
            '<b>No new users</b> to add',
            2500
          );
          return EMPTY;
        }
        return this.usersSvc.bulkAddUsers(newUsers);
      })
    ).subscribe({
      next: () => {
        this.showNotification(
          '<b>CSV upload</b> successful!',
          3000
        );
        this.csvUsers = [];
        this.csvHeaders = [];
        this.isCsvPreviewVisible = false;
        this.users.clear();
        this.users.push(this.createUserGroup());
      },
      error: err => {
        this.showNotification(
          `CSV upload error:<br><i>${err.status} – ${err.error?.message || err.message}</i>`,
          5000
        );
      }
    });
  }

  private showNotification(message: string, duration = 3000) {
    this.snackBar.openFromComponent(HtmlSnackComponent, {
      data: { message },
      duration
    });
  }
}
