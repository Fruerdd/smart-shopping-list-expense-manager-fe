// src/app/features/home/home.component.ts
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { HttpClientModule }  from '@angular/common/http';
import { Router }            from '@angular/router';
import { UsersService, TestimonialDTO } from '@app/services/users.service';
import { AuthService }       from '@app/services/auth.service'; 
import { isPlatformBrowser } from '@angular/common';

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

  private isBrowser: boolean;

  constructor(
    private usersSvc: UsersService,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    // Detect whether we're running in the browser (avoids SSR errors)
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Safe to call onResize even under SSR because it checks isBrowser
    this.onResize();  
    this.usersSvc.getTestimonials()
      .subscribe(dtos => this.testimonials = dtos.map(this.toView.bind(this)));
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;

    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
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
  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) {
      // Skip resizing logic on the server
      return;
    }
    this.itemsToShow = window.innerWidth <= 768 ? 1 : 3;
  }

  private toView(dto: TestimonialDTO): TestimonialView {
    const raw   = typeof dto.reviewScore === 'number' && !isNaN(dto.reviewScore)
      ? dto.reviewScore
      : 0;
    const score = Math.max(0, Math.min(5, raw));
    return {
      avatar:  this.getFullImageUrl(dto.avatar) || 'assets/avatars/avatar-generic.png',
      name:    dto.name,
      score,
      context: dto.reviewContext
    };
  }

  get visibleTestimonials(): TestimonialView[] {
    const n = this.testimonials.length;
    if (!n) return [];
    return Array.from({ length: this.itemsToShow }, (_, i) =>
      this.testimonials[(this.startIndex + i) % n]
    );
  }

  prev() {
    const n = this.testimonials.length;
    this.startIndex = (this.startIndex - this.itemsToShow + n) % n;
  }

  next() {
    const n = this.testimonials.length;
    this.startIndex = (this.startIndex + this.itemsToShow) % n;
  }

  starClass(i: number, score: number): string {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    if (i < full)              return 'fas fa-star';
    else if (i === full && half) return 'fas fa-star-half-alt';
    else                        return 'far fa-star';
  }
}
