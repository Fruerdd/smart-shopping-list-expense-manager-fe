import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { environment } from './environments/environment';
import { AppComponent } from '@app/app.component';
import { routes } from '@app/app-routing.module';
import { appConfig } from '@app/app.config';

import {
  Chart,
  ArcElement,
  PieController,
  Tooltip,
  Legend } from 'chart.js';

Chart.register(ArcElement, PieController, Tooltip, Legend);


if (environment.production) {
  enableProdMode();
}
console.log('🛰️  environment.apiUrl =', environment.apiUrl);

bootstrapApplication(AppComponent, appConfig);
