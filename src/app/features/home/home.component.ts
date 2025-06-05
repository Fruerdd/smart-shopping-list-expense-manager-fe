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
import {
  UsersService,
  TestimonialDTO
} from '@app/services/users.service';
import { UserProfileService } from '@app/services/user-profile.service';
import { AuthService }       from '@app/services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, of }      from 'rxjs';
import { map, catchError }   from 'rxjs/operators';
import { ImageUrlService } from 'src/app/services/image-url.service';

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
export class HomeComponent implements OnInit {
  testimonials: TestimonialView[] = [];
  startIndex   = 0;
  itemsToShow  = 3;
  hoverMap: { [i: number]: boolean } = {};
  private isBrowser: boolean;

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
    // SSR‐safe resize logic
    this.onResize();

    // load & enrich testimonials
    this.usersSvc.getTestimonials().subscribe({
      next: dtos => this.loadWithAvatars(dtos),
      error: err => {
        console.error('Failed to load testimonials:', err);
        this.testimonials = [];
      }
    });
  }

  private loadWithAvatars(dtos: TestimonialDTO[]) {
    const calls = dtos.map(dto =>
      this.userProfileService.searchUsers(dto.name).pipe(
        map(users => {
          // pick exact name match
          const match = users.find(u =>
            u.name.toLowerCase() === dto.name.toLowerCase()
          );
          return this.toView(dto, match?.avatar);
        }),
        catchError(err => {
          console.error(`Error enriching ${dto.name}:`, err);
          return of(this.toView(dto, dto.avatar));
        })
      )
    );

    forkJoin(calls).subscribe({
      next: views => this.testimonials = views,
      error: err => {
        console.error('Error during forkJoin:', err);
        // fallback to raw views
        this.testimonials = dtos.map(dto => this.toView(dto, dto.avatar));
      }
    });
  }

  private toView(dto: TestimonialDTO, avatarPath?: string|null) : TestimonialView {
    const raw   = typeof dto.reviewScore === 'number' && !isNaN(dto.reviewScore)
      ? dto.reviewScore : 0;
    const score = Math.max(0, Math.min(5, raw));
    const avatarUrl = this.getFullImageUrl(avatarPath) || '/assets/images/avatar.png';

    return {
      avatar:  avatarUrl,
      name:    dto.name,
      score,
      context: dto.reviewContext
    };
  }

  getFullImageUrl(path?: string|null): string|null {
    return this.imageUrlService.getFullImageUrl(path);
  }

  onStartShopping() {
    this.router.navigate([ this.auth.isLoggedIn() ? '/dashboard' : '/signup' ]);
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;
    this.itemsToShow = window.innerWidth <= 768 ? 1 : 3;
  }

  get visibleTestimonials(): TestimonialView[] {
    const n = this.testimonials.length;
    if (n === 0) return [];
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
    if (i < full)            return 'fas fa-star';
    if (i === full && half)  return 'fas fa-star-half-alt';
    return 'far fa-star';
  }

  setDefaultAvatar(evt: Event) {
    (evt.target as HTMLImageElement).src = '/assets/images/avatar.png';
  }
}
