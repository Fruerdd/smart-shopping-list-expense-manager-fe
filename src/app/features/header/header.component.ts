import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {filter, switchMap} from 'rxjs/operators';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {AuthService} from '@app/services/auth.service';
import {UserProfileService} from '@app/services/user-profile.service';
import {NotificationsComponent} from '@app/features/notifications/notifications.component';
import {interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatIconButton,
    MatIcon,
    MatIconModule,
    NotificationsComponent
  ]
})
export class HeaderComponent implements AfterViewInit, OnInit, OnDestroy {
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
  isOtherUserProfilePage: boolean = false;
  isEditProfilePage: boolean = false;
  isAdminPage: boolean = false;
  isAdmin: boolean = false; // Mimic admin state
  loggedInUserId: string | null = null;
  currentProfileUserId: string | null = null;
  userType: string | null = null;

  // Notification properties
  showNotifications = false;
  unreadNotificationCount = 0;
  private notificationSubscription: Subscription | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private authService: AuthService,
    private userProfileService: UserProfileService
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
      this.parseUserInfo();

      if (!this.loggedInUserId) {
        this.getCurrentUserIdFromApi();
      } else {
        this.initializeNotifications();
      }
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
      const token = this.authService.getToken();
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload) {
          this.loggedInUserId = tokenPayload.id || tokenPayload.userId || null;
          this.userType = tokenPayload.userType || null;
          this.isAdmin = this.userType === 'ADMIN';
        }
      }

      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.loggedInUserId = user.id || this.loggedInUserId;
        this.userType = user.userType || this.userType;
        this.isAdmin = this.userType === 'ADMIN' || this.isAdmin;
      }

      if (this.loggedInUserId && !this.isValidUUID(this.loggedInUserId)) {
        this.loggedInUserId = null;
      }
    } catch (error) {
      console.error('Error parsing user information:', error);
    }
  }

  private isValidUUID(str: string): boolean {
    return /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(str);
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playMusic();
      this.backgroundMusicRef.nativeElement.muted = true;
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
    const profileMatch = url.match(/^\/user-profile\/([^\/]+)/);
    if (profileMatch) {
      this.currentProfileUserId = profileMatch[1];

      this.isMyProfilePage = this.currentProfileUserId === this.loggedInUserId;
      this.isOtherUserProfilePage = this.currentProfileUserId !== this.loggedInUserId && this.isValidUUID(this.currentProfileUserId);
    } else {
      this.currentProfileUserId = null;
      this.isMyProfilePage = url === '/user-profile' || url === '/user-profile/';
      this.isOtherUserProfilePage = false;
    }

    this.isDashboardPage = url === '/dashboard';
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

    if (this.showNotifications && event.target instanceof Element) {
      const clickedInsideNotifications = event.target.closest('.notifications-popup');
      const clickedNotificationButton = event.target.closest('.notifications-menu-item');
      if (!clickedInsideNotifications && !clickedNotificationButton) {
        this.closeNotifications();
      }
    }
  }

  checkViewport(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView = window.innerWidth <= 1200;
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
    this.activePage = 'home';
    this.router.navigate(['/home']).then((success) => {
      if (success) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }).catch(() => {
      this.router.navigate(['/']);
    });
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

  private getCurrentUserIdFromApi(): void {
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.loggedInUserId = user.id;
        this.initializeNotifications();
      },
      error: (error) => {
        console.error('Error getting current user ID:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }

  private loadNotificationCount() {
    if (!this.loggedInUserId) return;

    this.userProfileService.getUnreadNotificationCount(this.loggedInUserId).subscribe({
      next: (count) => {
        this.unreadNotificationCount = count;
      },
      error: (error) => {
        console.error('Error loading notification count:', error);
      }
    });
  }

  private startNotificationPolling() {
    if (!this.loggedInUserId) return;

    this.notificationSubscription = interval(30000)
      .pipe(
        switchMap(() => this.userProfileService.getUnreadNotificationCount(this.loggedInUserId!))
      )
      .subscribe({
        next: (count) => {
          this.unreadNotificationCount = count;
        },
        error: (error) => {
          console.error('Error polling notification count:', error);
        }
      });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  onNotificationCountChanged(count: number) {
    this.unreadNotificationCount = count;
  }

  private initializeNotifications() {
    if (this.loggedInUserId) {
      this.loadNotificationCount();
      this.startNotificationPolling();
    }
  }
}
