import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.css']
})
export class AddUsersComponent {
  usersForm: FormGroup;

  // CSV upload state
  csvHeaders: string[] = [];
  csvUsers: any[] = [];
  isCsvPreviewVisible = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
      userType: [''],
      isActive: [true],
      reviewScore: [0],
      reviewContext: ['']
    });
  }

  addUser(): void {
    this.users.push(this.createUserGroup());
  }

  removeUser(i: number): void {
    this.users.removeAt(i);
  }

  onSubmit(): void {
    if (!this.usersForm.valid) return;
    const usersData = this.usersForm.value.users;
    this.http
      .post('http://localhost:8080/api/users/bulk', usersData, {
        headers: { 'Content-Type': 'application/json' }
      })
      .subscribe({
        next: () => alert('Users added successfully'),
        error: err => {
          console.error(err);
          alert(`Error: ${err.message || err.status}`);
        }
      });
  }

  // —— CSV Upload Handlers —— //

  onCsvFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      this.csvHeaders = headers;

      this.csvUsers = lines.slice(1).map(line => {
        const cols = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, idx) => {
          let val: any = cols[idx] ?? '';
          // coerce types
          if (h === 'bonusPoints' || h === 'reviewScore') {
            val = Number(val) || 0;
          } else if (h === 'isActive') {
            val = val.toLowerCase() === 'true' || val === '1';
          }
          obj[h] = val;
        });
        return obj;
      });

      this.isCsvPreviewVisible = true;
    };
    reader.readAsText(file);
  }

  uploadCsv() {
    if (!this.csvUsers.length) return;
    this.http
      .post('http://localhost:8080/api/users/bulk', this.csvUsers, {
        headers: { 'Content-Type': 'application/json' }
      })
      .subscribe({
        next: () => {
          alert('CSV users uploaded successfully');
          // clear preview & reset form
          this.isCsvPreviewVisible = false;
          this.csvUsers = [];
          this.csvHeaders = [];
          while (this.users.length) {
            this.users.removeAt(0);
          }
          this.users.push(this.createUserGroup());
        },
        error: err => {
          console.error(err);
          alert(`CSV upload error: ${err.message || err.status}`);
        }
      });
  }
}
