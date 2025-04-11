import { Component, HostListener, Inject, PLATFORM_ID, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {Router, NavigationEnd, RouterLink, RouterLinkActive} from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class HeaderComponent implements AfterViewInit, OnInit {

  activePage: string = '';
  menuValue: boolean = false;
  menu_icon: string = 'bx bx-menu';
  isMobileView: boolean = false;
  isDashboardPage: boolean = false;
  isShoppingListPage: boolean = false;
  isMyProfilePage: boolean = false;
  isAdminPage: boolean = false;
  isAdmin: boolean = false; // Mimic admin state
  loggedInUserId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('loggedInUser');
    }
    return false;
  }

  ngOnInit(): void {
    this.checkViewport();

    if (isPlatformBrowser(this.platformId) && this.isLoggedIn) {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.loggedInUserId = user.id;
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

  private updateActivePageFromUrl(url: string): void {
    this.isDashboardPage = url === '/dashboard';
    this.isMyProfilePage = url === '/user-profile' || url.startsWith('/user-profile/');
    this.isAdminPage = url === '/admin-page';
    this.isShoppingListPage = url === '/dashboard/shopping-list';

    if (url === '/') {
      this.activePage = 'home';
    } else if (url === '/dashboard') {
      this.activePage = 'dashboard';
    } else if (url.startsWith('/user-profile')) {
      this.activePage = 'user-profile';
    } else if (url === '/admin-page') {
      this.activePage = 'admin';
    } else if (url === '/login') {
      this.activePage = 'login';
    } else if (url === '/about') {
      this.activePage = 'about';
    } else if (url === '/dashboard/shopping-list') {
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
  onClick(event: MouseEvent): void {
    const clickedInsideMenu = event.target instanceof Element && event.target.closest('.desktop_menu');
    const clickedInsideMenuIcon = event.target instanceof Element && event.target.closest('.menu-icon');
    if (this.menuValue && !clickedInsideMenu && !clickedInsideMenuIcon) {
      this.closeMenu();
    }
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
    localStorage.removeItem('loggedInUser');
    this.loggedInUserId = null;
    this.router.navigate(['/login']);
  }
}
