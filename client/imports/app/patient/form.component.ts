import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {MeteorComponent} from 'angular2-meteor';
import { Patients } from '../../../../both/collections/csvs.collection';
import { Patient } from "../../../../both/models/csv.model";
import { InjectUser } from "angular2-meteor-accounts-ui";
import template from './form.component.html';
import {showAlert} from "../shared/show-alert";

@Component({
  selector: 'patient-form',
  template,
  styles: [ ]
})
@InjectUser("user")
export class PatientFormComponent extends MeteorComponent implements OnInit {
  patientSub: Observable<any[]>;
  patientForm: FormGroup;
  patientId: string;
  patient: Patient;
  paramsSub: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router, 
    private ngZone: NgZone
  ) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['patientId'])
      .subscribe(patientId => {
        this.patientId = patientId;
        //console.log("patientId:", patientId);

        if (!!this.patientId && this.patientId.length) {
            this.call("patients.findOne", patientId, (err, patient) => {
                if (err) {
                    //console.log("error while fetching patient:", err);
                    showAlert("Error while fetching patient record.", "danger");
                    return;
                }
                this.patient = patient;
                this.patientForm.controls['firstName'].setValue(patient.firstName);
                this.patientForm.controls['lastName'].setValue(patient.lastName);
                this.patientForm.controls['email'].setValue(patient.email);
                this.patientForm.controls['address'].setValue(patient.address);
                this.patientForm.controls['city'].setValue(patient.city);
                this.patientForm.controls['state'].setValue(patient.state);
                this.patientForm.controls['zip'].setValue(patient.zip);
                this.patientForm.controls['bio'].setValue(patient.bio);
                this.patientForm.controls['gender'].setValue(patient.gender);
                this.patientForm.controls['company'].setValue(patient.company);
                this.patientForm.controls['phoneNum'].setValue(patient.phoneNum);
            });
        }

      });
      
      this.patientForm = this.formBuilder.group({
        firstName: ['', Validators.compose([Validators.required, Validators.pattern("[a-zA-Z ]{2,30}")]) ],
        lastName: ['', Validators.compose([Validators.required, Validators.pattern("[a-zA-Z ]{2,30}")]) ],
        email: ['', Validators.compose([Validators.required, Validators.pattern("[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}")]) ],
        address: ['', Validators.compose([Validators.maxLength(40), Validators.required]) ],
        city: ['', Validators.compose([Validators.maxLength(20), Validators.required]) ],
        state: ['', Validators.compose([Validators.maxLength(20), Validators.required]) ],
        zip: ['', Validators.compose([Validators.maxLength(5), Validators.required]) ],
        bio: ['', Validators.compose([Validators.maxLength(100), Validators.required]) ],
        gender: ['', Validators.compose([Validators.maxLength(6), Validators.required]) ],
        company: ['', Validators.compose([Validators.maxLength(20), Validators.required]) ],
        phoneNum: ['', Validators.compose([Validators.required, Validators.pattern("[\s()+-]*([0-9][\s()+-]*){6,20}")]) ]
        });
  }

  savePatient(): void {
    if (! Meteor.userId()) {
      showAlert('Please log in to update patient.', "danger");
      return;
    }

    if (this.patientForm.valid) {
      Meteor.call("patients.update", this.patientId, this.patientForm.value, (err, res) => {
          //console.log("patient.update callback");
          if (err) {
              //console.log("error updating patient:", err);
              showAlert("Error updating patient.", "danger")
              return;
          }
          showAlert("Patient record updated.", "success");
          this.router.navigate( ['/patients/list'] );
          //this.patientForm.reset();
      })
      
    } else {
      console.log("formbuilder:", this.formBuilder);
      showAlert("Please type correct values.", "warning")
    }
  }
  
    cancelAction():void{
        this.router.navigate( ['/patients/details/'+this.patientId] );
    }

}