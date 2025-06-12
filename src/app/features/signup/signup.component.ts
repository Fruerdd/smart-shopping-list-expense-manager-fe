import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {AuthService, RegisterDTO} from '@app/services/auth.service';
import {PopupComponent} from '@app/features/shared-popup/popup.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PopupComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  imageUrl: string = 'assets/images/signup_image.png';
  showPopup: boolean = false;
  popupTitle: string = '';
  popupMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const {password, confirmPassword, email, name} = this.signupForm.value;

      if (password !== confirmPassword) {
        this.showErrorPopup('Validation Error', 'Passwords do not match!');
        return;
      }

      const newUser: RegisterDTO = {name, email, password};

      this.authService.register(newUser).subscribe({
        next: () => {
          this.showSuccessPopup('Success', 'Registration successful! Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          let errorMessage = 'Unknown error occurred';

          if (err.error && typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }

          if (errorMessage.includes('Email already registered')) {
            this.showErrorPopup('Registration Failed', 'This email address is already registered. Please use a different email or try logging in.');
          } else {
            this.showErrorPopup('Registration Failed', `Registration failed: ${errorMessage}`);
          }
        },
      });
    } else {
      this.signupForm.markAllAsTouched();
      this.showErrorPopup('Validation Error', 'Please fill in all required fields correctly.');
    }
  }

  private showErrorPopup(title: string, message: string) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.showPopup = true;
  }

  private showSuccessPopup(title: string, message: string) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.showPopup = true;
  }

  onPopupClose() {
    this.showPopup = false;
  }
}
