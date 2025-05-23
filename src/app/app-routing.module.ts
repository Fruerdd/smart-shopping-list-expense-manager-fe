import { Routes } from '@angular/router';
import { ServerRoute, RenderMode } from '@angular/ssr';
import { AddEditStoreComponent } from './features/admin-page/add-edit-store/add-edit-store.component';

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
      },
      {
        path: 'shopping-list/:id',
        loadComponent: () => import('@app/features/shopping-list-page/shopping-list-page.component')
          .then(m => m.ShoppingListPageComponent)
      }
    ],
  },
  {
    path: 'admin-page',
    loadComponent: () => import('./features/admin-page/admin-page.component')
      .then(m => m.AdminPageComponent),
      children: [
        {
          path: 'add-users',
          loadComponent: () => import('./features/admin-page/add-users/add-users.component')
          .then(m => m.AddUsersComponent)
        },
        { path: 'add-edit-store', component: AddEditStoreComponent },
        {
          path: 'edit-users',
          loadComponent: () => import('./features/admin-page/edit-users/edit-users.component')
          .then(m => m.EditUsersComponent)
        },
        {
          path: 'add-products',
          loadComponent: () => import('./features/admin-page/add-products/add-products.component')
          .then( m=> m.AddProductsComponent)
        },
        {
          path: 'add-products/:storeId',
          loadComponent: () => import('./features/admin-page/add-products/add-products.component').then(m => m.AddProductsComponent)
        },
        {
          path: 'edit-products',
          loadComponent: () =>
            import('./features/admin-page/edit-products/edit-products.component')
              .then(m => m.EditProductsComponent)
        },
        {
          path: 'edit-products/:storeId',
          loadComponent: () =>
            import('./features/admin-page/edit-products/edit-products.component')
              .then(m => m.EditProductsComponent)
        },
      ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/signup/signup.component')
      .then(m => m.SignupComponent)
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./features/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent)
  },
  {
    path: 'user-profile/:id',
    loadComponent: () => import('./features/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent)
  },
  {
  path: 'user-profiles/edit/:id',
  loadComponent: () =>
    import('./features/user-edit/user-edit.component').then(m => m.UserEditComponent)
},

  { path: '**', redirectTo: '/home' }
];

export const serverRoutes: ServerRoute[] = routes
  .filter((route): route is ServerRoute => route.path !== undefined)
  .map(route => {
    // For example, if you want the "admin-page" to be rendered on the client
    // and the rest on the server, adjust accordingly.
    if (route.path === 'admin-page') {
      return { ...route, renderMode: RenderMode.Client };
    }
    return { ...route, renderMode: RenderMode.Server };
  });
