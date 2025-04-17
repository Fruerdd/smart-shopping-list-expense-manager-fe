import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.css']
})
export class AddUsersComponent {
  usersForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.usersForm = this.fb.group({
      users: this.fb.array([this.createUserGroup()])
    });
  }

  get users(): FormArray {
    return this.usersForm.get('users') as FormArray;
  }

  createUserGroup(): FormGroup {
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

  removeUser(index: number): void {
    this.users.removeAt(index);
  }

  onSubmit(): void {
    if (this.usersForm.valid) {
      const usersData = this.usersForm.value.users;
      console.log('Submitting:', usersData);  // Debug: Verify the data structure
      this.http.post('http://localhost:8080/api/users/bulk', usersData, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe({
        next: () => alert('Users added successfully'),
        error: (err) => {
          console.error('HTTP error:', err);
          alert('Error: ' + err.message);
        }
      });
    }
  }  
}
