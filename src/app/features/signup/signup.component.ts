import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {AuthService, RegisterDTO} from '@app/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  imageUrl: string = 'assets/images/signup_image.png';
  errorMessage: string = '';
  successMessage: string = '';

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
      // Clear previous messages
      this.errorMessage = '';
      this.successMessage = '';

      // Destructure form values
      const {password, confirmPassword, email, name} = this.signupForm.value;

      // Check if passwords match
      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }

      // Create the RegisterDTO object to send to the backend
      const newUser: RegisterDTO = {name, email, password};

      // Call the register method from AuthService
      this.authService.register(newUser).subscribe({
        next: () => {
          // Display success message
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          console.error('Registration failed:', err);

          // Handle specific error cases
          let errorMessage = 'Unknown error occurred';

          if (err.error && typeof err.error === 'string') {
            // For plain text errors
            errorMessage = err.error;
          } else if (err.error?.message) {
            // For JSON formatted errors with message
            errorMessage = err.error.message;
          } else if (err.message) {
            // Fallback to HTTP error message
            errorMessage = err.message;
          }

          // Check for common error patterns
          if (errorMessage.includes('Email already registered')) {
            this.errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
          } else {
            this.errorMessage = `Registration failed: ${errorMessage}`;
          }
        },
      });
    } else {
      // Mark all fields as touched to display validation errors
      this.signupForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
