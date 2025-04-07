import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app-routing.module';
import { provideHttpClient, withFetch } from '@angular/common/http';


export const appConfig = {
  providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(withFetch())]
};
