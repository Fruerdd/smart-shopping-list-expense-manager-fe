import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  imageUrl: string = 'assets/images/slika1.jpg';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe(user => {
        if (user) {
          localStorage.setItem('loggedInUser', JSON.stringify(user));
          console.log('Korisnik sačuvan u localStorage:', JSON.parse(localStorage.getItem('loggedInUser')!));

          this.router.navigate(['/user-profile', user.id]);
        } else {
          alert('Either your username or password is wrong');
        }
      });
    }
  }
}
