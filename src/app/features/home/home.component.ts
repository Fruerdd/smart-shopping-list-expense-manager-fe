// src/app/features/home/home.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { HttpClientModule }  from '@angular/common/http';
import { Router }            from '@angular/router';
import { UsersService, TestimonialDTO } from '@app/services/users.service';
import { AuthService }       from '@app/services/auth.service'; 

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

  constructor(private usersSvc: UsersService, private auth:     AuthService,
    private router:   Router) {}

  ngOnInit() {
    this.onResize();  // set itemsToShow initially
    this.usersSvc.getTestimonials()
      .subscribe(dtos => this.testimonials = dtos.map(this.toView.bind(this)));
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
    this.itemsToShow = window.innerWidth < 768 ? 1 : 3;
  }

  private toView(dto: TestimonialDTO): TestimonialView {
    const raw   = typeof dto.reviewScore === 'number' && !isNaN(dto.reviewScore) ? dto.reviewScore : 0;
    const score = Math.max(0, Math.min(5, raw));
    return {
      avatar:  dto.avatar || 'assets/avatars/avatar-generic.png',
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
}
