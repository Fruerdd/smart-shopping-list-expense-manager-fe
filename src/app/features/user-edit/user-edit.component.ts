import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '@app/services/user-profile.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  user: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const routeId = this.route.snapshot.paramMap.get('id'); // UUID as string

      if (routeId && routeId !== 'null') {
        this.userProfileService.getUserProfileById(routeId).subscribe({
          next: (data) => {
            this.user = data;
          },
          error: (error) => {
            console.error('Error fetching user profile:', error);
            alert('Invalid user ID or profile not found');
            this.router.navigate(['/']);
          },
        });
      } else {
        alert('Invalid user ID');
        this.router.navigate(['/']);
      }
    }
  }

  onSubmit(): void {
    if (this.user?.id) {
      this.userProfileService.updateUserProfile(this.user.id, this.user).subscribe({
        next: () => {
          alert('Profile updated successfully!');
          this.router.navigate(['/user-profile', this.user.id]); // Redirect to profile
        },
        error: (error) => {
          console.error('Error updating user profile:', error);
          alert('Failed to update profile. Please try again.');
        },
      });
    } else {
      alert('No user data available to update');
    }
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/avatar.png';
  }
}
