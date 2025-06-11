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
  private autoAdvanceTimer?: number;
  private isAutoAdvancing = true;
  private touchStartX = 0;
  private touchEndX = 0;
  isTransitioning = false;

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
      next: dtos => {
        this.loadWithAvatars(dtos);
        // Start auto-advance after testimonials are loaded
        if (this.isBrowser) {
          setTimeout(() => this.startAutoAdvance(), 3000); // Start after 3 seconds
        }
      },
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
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, 
      rootMargin: '0px 0px -50px 0px' 
    });

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => this.observer.observe(el));
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.stopAutoAdvance();
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
        let filtered = views.filter(v => v.score >= 4);
  
        filtered = filtered.slice(0, 15);
  
        this.testimonials = filtered;
        this.startIndex = 0;
      },
      error: () => {
        let fallback = dtos.map(dto => this.toView(dto, dto.avatar))
                          .filter(v => v.score >= 4)
                          .slice(0, 15);
        this.testimonials = fallback;
        this.startIndex = 0;
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

  onCreateAccount() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/user-profile']);
    } else {
      this.router.navigate(['/signup']);
    }
  }

  onBuildShoppingList() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onCompareAndSave() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onTrackExpenses() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/user-profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onEarnRewards() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/user-profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }


  get pages(): number[] {
    return Array(Math.ceil(this.testimonials.length / this.itemsToShow)).fill(0);
  }

  get currentPage(): number {
    return Math.floor(this.startIndex / this.itemsToShow);
  }

  goToPage(pageIndex: number): void {
    this.startIndex = pageIndex * this.itemsToShow;
  }

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

  private startAutoAdvance() {
    if (!this.isBrowser || this.testimonials.length <= this.itemsToShow) {
      return;
    }
    
    this.autoAdvanceTimer = window.setInterval(() => {
      if (this.isAutoAdvancing && !this.isTransitioning) {
        this.nextPage();
      }
    }, 4000);
  }

  private stopAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = undefined;
    }
  }

  private pauseAutoAdvance() {
    this.isAutoAdvancing = false;
  }

  private resumeAutoAdvance() {
    this.isAutoAdvancing = true;
  }

  onTouchStart(event: TouchEvent) {
    if (!this.isBrowser || window.innerWidth > 768) return;
    
    this.touchStartX = event.touches[0].clientX;
    this.pauseAutoAdvance();
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isBrowser || window.innerWidth > 768) return;
    
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
    
    setTimeout(() => this.resumeAutoAdvance(), 2000);
  }

  private handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        this.nextPage();
      } else {
        this.previousPage();
      }
    }
  }

  nextPage() {
    if (this.isTransitioning) return;
    
    const nextIndex = this.startIndex + this.itemsToShow;
    if (nextIndex >= this.testimonials.length) {
      this.goToPageWithAnimation(0);
    } else {
      this.goToPageWithAnimation(Math.floor(nextIndex / this.itemsToShow));
    }
  }

  previousPage() {
    if (this.isTransitioning) return;
    
    const prevIndex = this.startIndex - this.itemsToShow;
    if (prevIndex < 0) {
      const lastPageIndex = Math.floor((this.testimonials.length - 1) / this.itemsToShow);
      this.goToPageWithAnimation(lastPageIndex);
    } else {
      this.goToPageWithAnimation(Math.floor(prevIndex / this.itemsToShow));
    }
  }

  private goToPageWithAnimation(pageIndex: number) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.startIndex = pageIndex * this.itemsToShow;
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600); 
  }

  onTestimonialMouseEnter() {
    this.pauseAutoAdvance();
  }

  onTestimonialMouseLeave() {
    this.resumeAutoAdvance();
  }
}
