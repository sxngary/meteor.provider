import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { Ng2PaginationModule } from 'ng2-pagination';
import {LocalStorageService, LOCAL_STORAGE_SERVICE_CONFIG} from "angular-2-local-storage";

import { AppComponent } from "./app.component.web";
import { routes, ROUTES_PROVIDERS } from './app.routes';
import { SHARED_DECLARATIONS } from './shared';
import {AUTH_DECLARATIONS} from "./auth/index";
import { LAYOUT_DECLARATIONS } from "./layout/index";
import {FileDropModule} from "angular2-file-drop";
import {DASHBOARD_DECLARATIONS} from "./dashboard/index";

// Create config options (see ILocalStorageServiceConfigOptions) for deets:
let localStorageServiceConfig = {
    prefix: 'my-app',
    storageType: 'sessionStorage'
};

let moduleDefinition;

moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AccountsModule,
    Ng2PaginationModule,
    FileDropModule
  ],
  declarations: [
    AppComponent,
    ...SHARED_DECLARATIONS,
    ...AUTH_DECLARATIONS,
    ...DASHBOARD_DECLARATIONS,
    ...LAYOUT_DECLARATIONS
  ],
  providers: [
    ...ROUTES_PROVIDERS,
    LocalStorageService,
      {
          provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: localStorageServiceConfig
      }
  ],
  bootstrap: [
    AppComponent
  ]
}

@NgModule(moduleDefinition)
export class AppModule {
  constructor() {
    
  }
}