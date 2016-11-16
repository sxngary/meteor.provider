import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'
import template from './main.layout.web.html';
import {InjectUser} from "angular2-meteor-accounts-ui";

@Component({
    selector: 'layout',
    template
})
@InjectUser('user')
export class MainLayoutComponent implements AfterViewInit {
    constructor(private router: Router) {}
    
    logout() {
        Meteor.logout();
        this.router.navigate( ['/login'] );
    }
  
    ngAfterViewInit() {
        jQuery(function($){
            $(".button-collapse").sideNav();
            $('select').material_select();
        })
    }
}
