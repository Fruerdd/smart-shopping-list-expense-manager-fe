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
      .then(m => m.UserDashboardComponent),
    children: [
      {
        path: 'shopping-list',
        loadComponent: () => import('@app/features/shopping-list-page/shopping-list-page.component')
          .then(m => m.ShoppingListPageComponent)
      }
      ],
},
  {
    path: 'admin-page',
    loadComponent: () => import('./features/admin-page/admin-page.component')
      .then(m => m.AdminPageComponent)

  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'user-profile/:id',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent)
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
