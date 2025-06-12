import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

import {AuthService} from '@app/services/auth.service';
import {PopupComponent} from '@app/features/shared-popup/popup.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PopupComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  imageUrl: string = 'assets/images/login_image.png';
  errorMessage: string = '';
  showPopup: boolean = false;
  popupTitle: string = '';
  popupMessage: string = '';

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

    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        if (res.userType === 'ADMIN') {
          this.router.navigate(['/admin-page']);
        } else {
          this.router.navigate(['/home']);
        }
      },

      error: () => {
        this.showErrorPopup('Login Failed', 'Please check your credentials and try again.');
      }
    });
  }

  private showErrorPopup(title: string, message: string) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.showPopup = true;
  }

  onPopupClose() {
    this.showPopup = false;
  }
}
