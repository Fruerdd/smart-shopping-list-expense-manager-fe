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
  activePage: string = 'home';
  menuValue: boolean = false;
  menu_icon: string = 'bx bx-menu';
  isMobileView: boolean = false;
  isLoggedIn: boolean = true; // Mimic logged-in state
  isDashboardPage: boolean = false;
  isMyProfilePage: boolean = false;
  isAdminPage: boolean = false;
  isAdmin: boolean = false; // Mimic admin state

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkViewport();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isDashboardPage = event.url === '/dashboard';
      this.isMyProfilePage = event.url === '/user-profile';
      this.isAdminPage = event.url === '/admin-page';
    });
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
}
