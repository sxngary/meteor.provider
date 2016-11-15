import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import template from './questionnaire.component.html';

@Component({
  selector: 'patient-questionnaire',
  template,
  styles: [ ]
})
@InjectUser("user")
export class PatientQuestionnaireComponent implements OnInit {
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

  updatePatient(): void {
    if (! Meteor.userId()) {
      alert('Please log in to update patient.');
      return;
    }

    if (this.patientForm.valid) {
      Meteor.call("patients.update", this.patientId, this.patientForm.value, (err, res) => {
          console.log("patient.update callback");
          if (err) {
              console.log("error updating patient:", err);
              return;
          }
          alert("Patient record updated.");
          //this.patientForm.reset();
      })
      
    }
  }

}