// src/app/features/login/login.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // ← add this so <img [src]="imageUrl"> compiles
  imageUrl: string = 'assets/images/slika1.jpg';

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
    const { email, password } = this.loginForm.value;
  
    this.authService.login(email, password).subscribe({
      next: res => {
        localStorage.setItem(this.authService['storageKey'], res.token);
        if (res.userType === 'ADMIN') {
          this.router.navigate(['/admin-page']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => alert('Username or password is wrong'),
    });
  }
}
