import './polyfills';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { SearchModule } from './app/search/search.module';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import './global-jasmine';
import 'jasmine-core/lib/jasmine-core/jasmine-html.js';
import 'jasmine-core/lib/jasmine-core/boot.js';
import 'zone.js/dist/zone-testing';
import './app/search/components/search/search.component.spec';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

declare var jasmine: { getEnv: () => any };

@NgModule({
  imports: [BrowserModule, SearchModule],
  entryComponents: [AppComponent],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}

if (environment.stackblitzTests) {
  bootstrap();
} else {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
  }

function bootstrap() {
  if ((window as any).jasmineRef) {
    location.reload();
    return;
  } else {
    window.onload(undefined);
    (window as any).jasmineRef = jasmine.getEnv();
  }

  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
}
