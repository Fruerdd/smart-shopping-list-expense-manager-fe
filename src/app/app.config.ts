// src/app/app.config.ts
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const appConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({
      onSameUrlNavigation: 'reload'
    })),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])
    )
  ]
};
