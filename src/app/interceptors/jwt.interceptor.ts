// src/app/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // Detect browser vs SSR/build
  const platformId = inject(PLATFORM_ID);
  const isBrowser  = isPlatformBrowser(platformId);

  // Skip interceptor for login and register endpoints
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  // Only read from localStorage in a browser environment
  const token = isBrowser ? localStorage.getItem('token') : null;

  // If token present, clone and set headers
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  return next(req);
};
