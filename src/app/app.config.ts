// src/app/app.config.ts
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { routes } from './app-routing.module';
import { JwtInterceptor } from '@app/interceptors/jwt.interceptor';

export const appConfig = {
  providers: [
    // 1. Wire up your routes with standalone input binding
    provideRouter(routes, withComponentInputBinding()),

    // 2. Bring in HttpClient (uses fetch under the hood)
    //    AND enable DI-registered interceptors
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),

    // 3. Register your JWT interceptor so every request
    //    gets Authorization: Bearer <token>
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
};
