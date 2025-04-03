import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
 
})
export class LoginComponent {
  loginForm: FormGroup;
  imageUrl: string = 'assets/images/slika1.jpg'

  // Dummy users for testing
  dummyUsers = [
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'user@example.com', password: 'user123' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const match = this.dummyUsers.find(
        user => user.email === email && user.password === password
      );

      if (match) {
        console.log('Login successful');
        this.router.navigate(['/home']);
      } else {
        alert('Invalid credentials');
      }
    }
  }
}
