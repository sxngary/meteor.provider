import { Component, AfterViewInit } from '@angular/core';

import template from './app.component.web.html';
import {InjectUser} from "angular2-meteor-accounts-ui";

@Component({
  selector: 'app',
  template
})
@InjectUser('user')
export class AppComponent implements AfterViewInit {
  constructor() {
  }

  logout() {
    Meteor.logout();
  }

  ngAfterViewInit() {
    jQuery(function($){
      $(".button-collapse").sideNav();
      $('select').material_select();
    })
  }
}
