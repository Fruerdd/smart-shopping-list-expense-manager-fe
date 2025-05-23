// src/app/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for login and register endpoints
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
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
