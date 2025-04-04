import { Routes } from '@angular/router';
import { ServerRoute, RenderMode } from '@angular/ssr';

 export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('@app/features/user-dashboard/user-dashboard.component')
      .then(m => m.UserDashboardComponent)
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./features/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent)
  },
  {
    path: 'admin-page',
    loadComponent: () => import('./features/admin-page/admin-page.component')
      .then(m => m.AdminPageComponent)

  },
  { path: '**', redirectTo: '/home' }
];

export const serverRoutes: ServerRoute[] = routes
.filter((route): route is ServerRoute => route.path !== undefined)
.map(route => {
  if (route.path === 'admin-page') {
    return { ...route, renderMode: RenderMode.Client };
  }
  return { ...route, renderMode: RenderMode.Server };
});
