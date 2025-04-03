import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(MatProgressSpinnerModule)
  ]
};
