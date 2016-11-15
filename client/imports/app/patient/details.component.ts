import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import template from './details.component.html';

@Component({
  selector: '',
  template
})
@InjectUser("user")
export class PatientDetailsComponent implements OnInit {
  patientSub: Observable<any[]>;  
  patientId: string;
  patient: Patient;
  paramsSub: Subscription;

  constructor(
    private route: ActivatedRoute, 
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.paramsSub = this.route.params
        .map(params => params['patientId'])
        .subscribe(patientId => {
            this.patientId = patientId;
            console.log("patientId:", patientId);
    
            this.patientSub = Observable.create(observer => {
                Meteor.call("patients.findOne", patientId, (err, res)=> {
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