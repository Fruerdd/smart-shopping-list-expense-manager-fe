import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '@app/services/user-profile.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
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
    const routeId = Number(this.route.snapshot.paramMap.get('id'));

    if (!isNaN(routeId)) {
      this.userProfileService.getUserProfile(routeId).subscribe(data => {
        this.user = data;
      });
    } else {
      alert('Invalid user ID');
      this.router.navigate(['/']);
    }
  }
}


  onSubmit(): void {
    this.userProfileService.updateUserProfile(this.user.id, this.user).subscribe(() => {
      alert('Profile updated successfully!');
      this.router.navigate(['/user-profile', this.user.id]); // redirect back to profile
    });
  }
  setDefaultImage(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/images/avatar.png';
}
}
