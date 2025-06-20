import {enableProdMode} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {environment} from './environments/environment';
import {AppComponent} from '@app/app.component';
import {appConfig} from '@app/app.config';

import {ArcElement, Chart, Legend, PieController, Tooltip} from 'chart.js';

Chart.register(ArcElement, PieController, Tooltip, Legend);


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig);
