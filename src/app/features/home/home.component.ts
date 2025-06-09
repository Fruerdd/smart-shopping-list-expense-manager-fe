import {Component, HostListener, Inject, OnInit, PLATFORM_ID, AfterViewInit, ElementRef, ViewChildren, QueryList, OnDestroy} from '@angular/core';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {Router} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {TestimonialDTO, UsersService} from '@app/services/users.service';
import {UserProfileService} from '@app/services/user-profile.service';
import {AuthService} from '@app/services/auth.service';
import {ImageUrlService} from 'src/app/services/image-url.service';


interface TestimonialView {
  avatar:  string;
  name:    string;
  score:   number;
  context: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  testimonials: TestimonialView[] = [];
  startIndex   = 0;
  itemsToShow  = 3;
  private readonly isBrowser: boolean;
  private observer!: IntersectionObserver;

  @ViewChildren('animateOnScroll') animateElements!: QueryList<ElementRef>;

  constructor(
    private usersSvc: UsersService,
    private userProfileService: UserProfileService,
    private auth: AuthService,
    private router: Router,
    private imageUrlService: ImageUrlService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.onResize();
    this.usersSvc.getTestimonials().subscribe({
      next: dtos => this.loadWithAvatars(dtos),
      error: err => {
        console.error('Failed to load testimonials:', err);
        this.testimonials = [];
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.setupScrollAnimations();
    }
  }

  private setupScrollAnimations() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Optional: Stop observing after animation is triggered
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully visible
    });

    // Observe all elements with scroll animation
    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => this.observer.observe(el));
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;
    this.itemsToShow = window.innerWidth <= 768 ? 1 : 3;
  }

  private loadWithAvatars(dtos: TestimonialDTO[]) {
    const calls = dtos.map(dto =>
      this.userProfileService.searchUsers(dto.name).pipe(
        map(users => {
          const match = users.find(u =>
            u.name.toLowerCase() === dto.name.toLowerCase()
          );
          return this.toView(dto, match?.avatar);
        }),
        catchError(() => of(this.toView(dto, dto.avatar)))
      )
    );

    forkJoin(calls).subscribe({
      next: views => {
        // ① filter out anything under score 4
        this.testimonials = views
          .filter(v => v.score >= 4);              // ← drop below-4 reviews
        // ② reset pagination if you want to start at page 0
        this.startIndex   = 0;
      },
      error: () => {
        // apply same filter in the error fallback
        this.testimonials = dtos
          .map(dto => this.toView(dto, dto.avatar))
          .filter(v => v.score >= 4);
        this.startIndex   = 0;
      }
    });
  }

  private toView(dto: TestimonialDTO, avatarPath?: string|null): TestimonialView {
    const raw   = !isNaN(dto.reviewScore)
      ? dto.reviewScore : 0;
    const score = Math.max(0, Math.min(5, raw));
    const avatarUrl = this.getFullImageUrl(avatarPath) || '/assets/images/avatar.png';
    return { avatar: avatarUrl, name: dto.name, score, context: dto.reviewContext };
  }

  getFullImageUrl(path?: string|null): string|null {
    return this.imageUrlService.getFullImageUrl(path);
  }

  onStartShopping() {
    this.router.navigate([ this.auth.isLoggedIn() ? '/dashboard' : '/signup' ]);
  }

  /** ── PAGINATION LOGIC ── **/

  // total pages = ceil(totalTestimonials / itemsToShow)
  get pages(): number[] {
    return Array(Math.ceil(this.testimonials.length / this.itemsToShow)).fill(0);
  }

  // which page we're on
  get currentPage(): number {
    return Math.floor(this.startIndex / this.itemsToShow);
  }

  // jump to a page
  goToPage(pageIndex: number): void {
    this.startIndex = pageIndex * this.itemsToShow;
  }

  // slice out the visible 3 (or 1 on mobile)
  get visibleTestimonials(): TestimonialView[] {
    return this.testimonials.slice(
      this.startIndex,
      this.startIndex + this.itemsToShow
    );
  }

  starClass(i: number, score: number): string {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    if (i < full)            return 'fas fa-star';
    if (i === full && half)  return 'fas fa-star-half-alt';
    return 'far fa-star';
  }

  setDefaultAvatar(evt: Event) {
    (evt.target as HTMLImageElement).src = '/assets/images/avatar.png';
  }
}
