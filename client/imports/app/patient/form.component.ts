import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
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
import * as moment from 'moment';

declare var jQuery:any;

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
                let dob = moment(patient.dob).format("YYYY-MM-DD");
                this.patientForm.controls['firstName'].setValue(patient.firstName);
                this.patientForm.controls['lastName'].setValue(patient.lastName);
                this.patientForm.controls['email'].setValue(patient.email);
                this.patientForm.controls['ssn'].setValue(patient.ssn);
                this.patientForm.controls['dob'].setValue(dob);
                this.patientForm.controls['address'].setValue(patient.address);
                this.patientForm.controls['city'].setValue(patient.city);
                this.patientForm.controls['state'].setValue(patient.state);
                this.patientForm.controls['zip'].setValue(patient.zip);
                this.patientForm.controls['bio'].setValue(patient.bio);
                this.patientForm.controls['gender'].setValue(patient.gender);
                this.patientForm.controls['company'].setValue(patient.company);
                this.patientForm.controls['phoneNum'].setValue(patient.phoneNum);
                this.patientForm.controls['groupId'].setValue(patient.groupId);
                this.patientForm.controls['personalId'].setValue(patient.personalId);
                this.patientForm.controls['insurer'].setValue(patient.insurer);
                this.patientForm.controls['guarantor'].setValue(patient.guarantor);
            });
        }

      });

      let emailRegex = "[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})";
      let ssnRegex = "[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}";
      let phoneRegex = "[\s()+-]*([0-9][\s()+-]*){6,20}";
      this.patientForm = this.formBuilder.group({
        firstName: ['', Validators.compose([Validators.required, Validators.pattern("[a-zA-Z ]{2,30}")]) ],
        lastName: ['', Validators.compose([Validators.required, Validators.pattern("[a-zA-Z ]{2,30}")]) ],
        email: ['', Validators.compose([Validators.maxLength(40), Validators.required, Validators.pattern(emailRegex)]) ],
        ssn: ['', Validators.compose([Validators.required, Validators.pattern(ssnRegex)]) ],
        dob: ['', Validators.compose([Validators.required]) ],
        address: ['', Validators.compose([Validators.required, Validators.maxLength(100)]) ],
        city: ['', Validators.compose([Validators.required, Validators.maxLength(20)]) ],
        state: ['', Validators.compose([Validators.required, Validators.maxLength(20)]) ],
        zip: ['', Validators.compose([Validators.required, Validators.maxLength(5)]) ],
        bio: ['', Validators.compose([Validators.required, Validators.maxLength(100)]) ],
        gender: ['', Validators.compose([Validators.required, Validators.maxLength(6)]) ],
        company: ['', Validators.compose([Validators.required, Validators.maxLength(40)]) ],
        phoneNum: ['', Validators.compose([Validators.required, Validators.pattern(phoneRegex)]) ],
        groupId: ['', Validators.compose([Validators.required, Validators.maxLength(20)]) ],
        personalId: ['', Validators.compose([Validators.required, Validators.maxLength(20)]) ],
        insurer: ['', Validators.compose([Validators.required, Validators.maxLength(20)]) ],
        guarantor: ['', Validators.compose([Validators.required, Validators.maxLength(20)]) ],
        });
  }

  savePatient(): void {
    if (! Meteor.userId()) {
      showAlert('Please log in to update patient.', "danger");
      return;
    }

    if (this.patientForm.valid) {
      if (!!this.patientId && this.patientId.length) {
        Meteor.call("patients.update", this.patientId, this.patientForm.value, (err, res) => {
            //console.log("patient.update callback");
            if (err) {
                //console.log("error updating patient:", err);
                showAlert("" + err, "danger");
                return;
            }
            showAlert("Patient updated successfully.", "success");
            this.router.navigate( ['/patients/list'] );
            //this.patientForm.reset();
        });
      } else {
        Meteor.call("patients.insert", this.patientForm.value, (err, res) => {
          if (err) {
            showAlert("" + err, "danger");
            return;
          }
          showAlert("Patient created successfully.", "success");
          this.router.navigate( ['/patients/list'] );
        });
      }
      
    } else {
      //console.log("formbuilder:", this.formBuilder);
      showAlert("Please type correct values.", "warning")
    }
  }
  
  cancelAction():void{
      if (!!this.patientId && this.patientId.length) {
        this.router.navigate( ['/patients/details', this.patientId] );
      } else {
        this.router.navigate( ['/patients/list'] );
      }
  }

  ngAfterViewInit() {
      jQuery(function($){
      $('select').material_select();
      $('.tooltipped').tooltip({delay: 50});
      /*$('.datepicker').pickadate({
          selectMonths: true, // Creates a dropdown to control month
          selectYears: 15 // Creates a dropdown of 15 years to control year
      });*/
      setTimeout(function(){ $('label').addClass("active"); }, 200);
      })
  }
}