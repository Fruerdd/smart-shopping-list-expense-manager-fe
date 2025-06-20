import {HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Observable} from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // Detect browser vs SSR/build
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Skip interceptor for login and register endpoints
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  // Only read from localStorage in a browser environment
  const token = isBrowser ? localStorage.getItem('token') : null;

  // If token present, clone and set headers
  if (token) {
    const headers: any = {
      Authorization: `Bearer ${token}`
    };

    // Only set Content-Type for non-FormData requests
    // FormData requests need the browser to set multipart/form-data with boundary
    if (!(req.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req);
};
