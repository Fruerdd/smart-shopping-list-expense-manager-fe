import {Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '@app/services/user-profile.service';
import { ImageUrlService } from '@app/services/image-url.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  user: any;
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  isUploading: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private imageUrlService: ImageUrlService
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.previewImageUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getFullImageUrl(avatarPath: string | null): string | null {
    return this.imageUrlService.getFullImageUrl(avatarPath);
  }

  onSubmit(): void {
    if (this.user?.id) {
      // Handle profile picture if selected
      if (this.selectedFile) {
        this.isUploading = true;
        // Upload file to server using the proper endpoint
        this.userProfileService.uploadProfilePicture(this.user.id, this.selectedFile).subscribe({
          next: (avatarPath) => {
            this.user.avatar = avatarPath;
            this.isUploading = false;
            this.clearSelectedFile();
            this.updateUserProfile();
          },
          error: (error) => {
            console.error('File upload failed:', error);
            this.isUploading = false;
            alert('Failed to upload profile picture. Please try again.');
          }
        });
      } else {
        this.updateUserProfile();
      }
    } else {
      alert('No user data available to update');
    }
  }

  private updateUserProfile(): void {
    this.userProfileService.updateUserProfile(this.user.id, this.user).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.router.navigate(['/user-profile', this.user.id]);
      },
      error: (error) => {
        console.error('Error updating user profile:', error);
        alert('Failed to update profile. Please try again.');
      },
    });
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/avatar.png';
  }
}
