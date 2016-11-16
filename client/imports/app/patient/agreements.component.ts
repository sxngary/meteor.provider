import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import template from './agreements.component.html';

@Component({
  selector: 'patient-agreement',
  template,
  styles: [ ]
})
@InjectUser("user")
export class PatientAgreementComponent implements OnInit {
  patientSub: Observable<any[]>;  

  constructor(
    private route: ActivatedRoute, 
    private ngZone: NgZone
  ) {}

    ngOnInit() {
        this.patientSub = Observable.create(observer => {
            Meteor.call("findAllQuestionnaires", (err, res)=> {
                if (err) {                   
                    observer.error(err);
                } else {
                    // reset data
                    observer.next(res);
                    observer.complete();
                }
            });
            return () => {              
                console.log("patientSub unsubscribed")
            };
        });
        this.getPatient();
    }

  getPatient() {
    this.patientSub.subscribe((patient) => {
        this.ngZone.run(() => {
            this.patient = patient;
        });
    }, err =>{
        console.error(err);
    });
  }

  

}