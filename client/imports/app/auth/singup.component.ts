import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';

import template from './signup.component.html';

@Component({
  selector: 'signup',
  template
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}

    ngOnInit() {
        var emailRegex = "[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})";
        this.signupForm = this.formBuilder.group({
          email: ['', Validators.compose([Validators.pattern(emailRegex), Validators.required])],
          password: ['', Validators.compose([Validators.required, Validators.minLength(6)]) ],
          firstName: ['', Validators.compose([Validators.required, Validators.pattern("[a-zA-Z ]{2,30}")])],
          lastName: ['', Validators.compose([Validators.required, Validators.pattern("[a-zA-Z ]{2,30}")])],
        });
  
        this.error = '';
    }

    signup() {
        if (this.signupForm.valid) {
          Accounts.createUser({
            email: this.signupForm.value.email,
            password: this.signupForm.value.password,
            type: "provider",
            profile: {
              firstName: this.signupForm.value.firstName,
              lastName: this.signupForm.value.lastName
            }
          }, (err) => {
            if (err) {
              this.zone.run(() => {
                this.error = err;
              });
            } else {
              this.router.navigate(['/dashboard']);
            }
          });
        }
    }
}