import {
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  OnInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, MatIconButton, MatIcon, MatIconModule]
})
export class HeaderComponent implements AfterViewInit, OnInit {
  @ViewChild('backgroundMusic') backgroundMusicRef!: ElementRef;
  @ViewChild('musicPopupDiv') musicPopupDivRef!: ElementRef;
  isPlaying = false;
  volume = 0.5;
  isMusicPopupVisible = false;

  activePage: string = '';
  menuValue: boolean = false;
  menu_icon: string = 'bx bx-menu';
  isMobileView: boolean = false;
  isDashboardPage: boolean = false;
  isShoppingListPage: boolean = false;
  isMyProfilePage: boolean = false;
  isEditProfilePage: boolean = false;
  isAdminPage: boolean = false;
  isAdmin: boolean = false; // Mimic admin state
  loggedInUserId: number | null = null;
  userType: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.authService.isLoggedIn();
    }
    return false;
  }

  ngOnInit(): void {
    this.checkViewport();

    if (isPlatformBrowser(this.platformId) && this.isLoggedIn) {
      // Try to get user information from token or localStorage
      this.parseUserInfo();
    }

    const currentUrl = this.router.url;
    this.updateActivePageFromUrl(currentUrl);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActivePageFromUrl(event.url);
    });
  }

  parseUserInfo(): void {
    try {
      // Get user information from JWT token if possible
      const token = this.authService.getToken();
      if (token) {
        // Basic parsing of JWT token to get user info
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload) {
          this.loggedInUserId = tokenPayload.id || tokenPayload.userId || null;
          this.userType = tokenPayload.userType || null;
          this.isAdmin = this.userType === 'ADMIN';
        }
      }

      // If you have additional user info in localStorage, parse it here
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.loggedInUserId = user.id || this.loggedInUserId;
        this.userType = user.userType || this.userType;
        this.isAdmin = this.userType === 'ADMIN' || this.isAdmin;
      }
    } catch (error) {
      console.error('Error parsing user information:', error);
    }
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playMusic();
      this.backgroundMusicRef.nativeElement.muted = true; // Mute the music
    } else {
      this.pauseMusic();
    }
  }

  playMusic(): void {
    this.backgroundMusicRef.nativeElement.muted = false;
    this.backgroundMusicRef.nativeElement.play().then(() => {
      this.backgroundMusicRef.nativeElement.muted = false;
      this.backgroundMusicRef.nativeElement.volume = this.volume;
      this.isPlaying = true;
    }).catch((error: any) => {
      console.error('Autoplay prevented:', error);
      this.isPlaying = false;
    });
  }

  pauseMusic(): void {
    this.backgroundMusicRef.nativeElement.pause();
    this.isPlaying = false;
  }

  toggleMusicPopup(): void {
    this.isMusicPopupVisible = !this.isMusicPopupVisible;
  }

  private updateActivePageFromUrl(url: string): void {
    this.isDashboardPage = url === '/dashboard';
    this.isMyProfilePage = url === '/user-profile' || url.startsWith('/user-profile/');
    this.isAdminPage = url === '/admin-page';
    this.isShoppingListPage = url === '/dashboard/shopping-list' || url.startsWith('/dashboard/shopping-list/');
    this.isEditProfilePage = url.startsWith('/user-profiles/edit');

    if (url === '/') {
      this.activePage = 'home';
    } else if (url === '/dashboard') {
      this.activePage = 'dashboard';
    } else if (url.startsWith('/user-profile')) {
      this.activePage = 'user-profile';
    } else if (url.startsWith('/user-profiles/edit')) {
      this.activePage = 'user-edit';
    } else if (url === '/admin-page') {
      this.activePage = 'admin';
    } else if (url === '/login') {
      this.activePage = 'login';
    } else if (url === '/about') {
      this.activePage = 'about';
    } else if (url.startsWith('/dashboard/shopping-list')) {
      this.activePage = 'shopping-list';
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuValue && this.isMobileView) {
      const clickedInsideMenu = event.target instanceof Element && event.target.closest('.desktop_menu');
      const clickedInsideMenuIcon = event.target instanceof Element && event.target.closest('.menu-icon');
      if (!clickedInsideMenu && !clickedInsideMenuIcon) {
        this.closeMenu();
      }
    }
    // if (this.isMusicPopupVisible && !this.isMobileView) {
    //     const clickedInsidePopup = this.musicPopupDivRef?.nativeElement.contains(event.target);
    //     if (!clickedInsidePopup) {
    //       this.isMusicPopupVisible = false;
    //     }
    //
    //   }
  }

  checkViewport(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView = window.innerWidth <= 900;
    }
  }

  activatePage(page: string): void {
    this.activePage = page;
    if (page === 'log-out') {
      this.logout();
      return;
    }

    if (this.isMobileView) {
      this.closeMenu();
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToTopAndActivateHome(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.activatePage('home');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openMenu(): void {
    this.menuValue = true;
    this.menu_icon = 'bx bx-x';
  }

  closeMenu(): void {
    this.menuValue = false;
    this.menu_icon = 'bx bx-menu';
  }

  logout(): void {
    this.authService.logout();
    this.loggedInUserId = null;
    this.userType = null;
    this.isAdmin = false;
    this.router.navigate(['/login']);
  }
}
