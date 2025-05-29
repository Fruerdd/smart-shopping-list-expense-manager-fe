// src/app/features/home/home.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { HttpClientModule }  from '@angular/common/http';
import { Router }            from '@angular/router';
import { UsersService, TestimonialDTO, UserDTO } from '@app/services/users.service';
import { UserProfileService } from '@app/services/user-profile.service';
import { AuthService }       from '@app/services/auth.service'; 
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface TestimonialView {
  avatar:  string;
  name:    string;
  score:   number;      // 0–5, can be fractional
  context: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  testimonials: TestimonialView[] = [];
  startIndex   = 0;

  /** Number of cards visible at once (1 on mobile, 3 on desktop) */
  itemsToShow = 3;

  /** track hover state per card index */
  hoverMap: { [i: number]: boolean } = {};

  constructor(
    private usersSvc: UsersService, 
    private userProfileService: UserProfileService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.onResize();  // set itemsToShow initially
    this.loadTestimonialsWithAvatars();
  }

  private loadTestimonialsWithAvatars() {
    this.usersSvc.getTestimonials().subscribe({
      next: (testimonials) => {
        // For each testimonial, try to find the user and get their avatar
        const testimonialPromises = testimonials.map(testimonial => 
          this.enrichTestimonialWithUserAvatar(testimonial)
        );
        
        forkJoin(testimonialPromises).subscribe({
          next: (enrichedTestimonials) => {
            this.testimonials = enrichedTestimonials;
          },
          error: (error) => {
            console.error('Error enriching testimonials:', error);
            // Fallback to basic testimonials
            this.testimonials = testimonials.map(this.toView.bind(this));
          }
        });
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.testimonials = [];
      }
    });
  }

  private enrichTestimonialWithUserAvatar(testimonial: TestimonialDTO) {
    // Use the same search approach as user profile component
    return this.userProfileService.searchUsers(testimonial.name).pipe(
      map((users) => {
        // Find exact match by name
        const matchingUser = users.find(user => 
          user.name.toLowerCase() === testimonial.name.toLowerCase()
        );
        
        const raw = typeof testimonial.reviewScore === 'number' && !isNaN(testimonial.reviewScore) ? testimonial.reviewScore : 0;
        const score = Math.max(0, Math.min(5, raw));
        
        const avatarUrl = matchingUser?.avatar 
          ? this.getFullImageUrl(matchingUser.avatar) || '/assets/images/avatar.png'
          : '/assets/images/avatar.png';

        return {
          avatar: avatarUrl,
          name: testimonial.name,
          score,
          context: testimonial.reviewContext
        };
      }),
      catchError((error) => {
        console.error(`Error searching for user ${testimonial.name}:`, error);
        // Fallback to basic testimonial without user avatar
        return of(this.toView(testimonial));
      })
    );
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    
    // If it's already a full URL or base64, return as is
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    
    // If it's a relative path, prepend the API base URL
    if (avatarPath.startsWith('/uploads/')) {
      return `http://localhost:8080${avatarPath}`;
    }
    
    return avatarPath;
  }

  onStartShopping() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/signup']);
    }
  }

  /** toggle 1 vs 3 cards as viewport crosses 768px */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.itemsToShow = window.innerWidth <= 768 ? 1 : 3;
  }

  private toView(dto: TestimonialDTO): TestimonialView {
    const raw   = typeof dto.reviewScore === 'number' && !isNaN(dto.reviewScore) ? dto.reviewScore : 0;
    const score = Math.max(0, Math.min(5, raw));
    return {
      avatar:  this.getFullImageUrl(dto.avatar) || '/assets/images/avatar.png',
      name:    dto.name,
      score,
      context: dto.reviewContext
    };
  }

  /** returns exactly itemsToShow testimonials in a wrap-around slice */
  get visibleTestimonials(): TestimonialView[] {
    const n = this.testimonials.length;
    if (!n) return [];
    return Array.from({ length: this.itemsToShow }, (_, i) =>
      this.testimonials[(this.startIndex + i) % n]
    );
  }

  /** step backward by itemsToShow */
  prev() {
    const n = this.testimonials.length;
    this.startIndex = (this.startIndex - this.itemsToShow + n) % n;
  }

  /** step forward by itemsToShow */
  next() {
    const n = this.testimonials.length;
    this.startIndex = (this.startIndex + this.itemsToShow) % n;
  }

  /** Determine star icon based on full/half/empty */
  starClass(i: number, score: number): string {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    if (i < full)            return 'fas fa-star';
    else if (i === full && half) return 'fas fa-star-half-alt';
    else                      return 'far fa-star';
  }

  setDefaultAvatar(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }
}
