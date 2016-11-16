import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'
import template from './landing.component.web.html';
import {InjectUser} from "angular2-meteor-accounts-ui";

@Component({
    selector: 'landing',
    template
})
@InjectUser('user')
export class LandingComponent implements AfterViewInit {
    constructor(private router: Router) {}
  
    ngAfterViewInit() {
        jQuery(function($){
            $(".button-collapse").sideNav();
            $('select').material_select();
        })
    }
}
