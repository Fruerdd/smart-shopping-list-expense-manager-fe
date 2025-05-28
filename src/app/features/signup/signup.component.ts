import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterDTO } from '@app/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  imageUrl: string = 'assets/images/slika1.jpg';

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
      // Destructure form values
      const { password, confirmPassword, email, name } = this.signupForm.value;

      // Check if passwords match
      if (password !== confirmPassword) {
        this.showMessageBox('Passwords do not match!', 'Error');
        return;
      }

      // Create the RegisterDTO object to send to the backend
      const newUser: RegisterDTO = { name, email, password };

      // Call the register method from AuthService
      this.authService.register(newUser).subscribe({
        next: (response) => {
          // Display success message
          this.showMessageBox('Registration successful!', 'Success');
          this.router.navigate(['/login']); // Navigate to login page on success
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
            this.showMessageBox('This email address is already registered. Please use a different email or try logging in.', 'Error');
          } else {
            this.showMessageBox(`Registration failed: ${errorMessage}`, 'Error');
          }
        },
      });
    } else {
      // Mark all fields as touched to display validation errors
      this.signupForm.markAllAsTouched();
      this.showMessageBox('Please fill in all required fields correctly.', 'Validation Error');
    }
  }

  private showMessageBox(message: string, type: string) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: ${type === 'Success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      font-family: 'Inter', sans-serif;
      text-align: center;
    `;
    messageDiv.innerText = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 3000); // Message disappears after 3 seconds
  }
}
