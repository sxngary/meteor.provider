import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { Patients } from '../../../../both/collections/csvs.collection';
import { Patient } from "../../../../both/models/csv.model";
import { InjectUser } from "angular2-meteor-accounts-ui";
import template from './form.component.html';

@Component({
  selector: 'patient-form',
  template,
  styles: [ ]
})
@InjectUser("user")
export class PatientFormComponent implements OnInit {
  patientSub: Observable<any[]>;
  patientForm: FormGroup;
  patientId: string;
  patient: Patient;
  paramsSub: Subscription;

  constructor(
    private formBuilder: FormBuilder,
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
    
    /*this.patient = {
        firstName: "Rahul",
        lastName: "Sethi",
        address: "E-37 Phase 8 Industrial area",
        company: "SmartData Enterprises",
        phoneNum: 9814012345
    };*/
    this.getPatient();
  }

  getPatient() {
    this.patientSub.subscribe((patient) => {

        this.ngZone.run(() => {
            this.patient = patient;
            this.patientForm = this.formBuilder.group({
            firstName: [patient.firstName, Validators.required],
            lastName: [patient.lastName, Validators.required],
            address: [patient.address, Validators.required],
            company: [patient.company, Validators.required],
            phoneNum: [patient.phoneNum, Validators.required]
            });
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