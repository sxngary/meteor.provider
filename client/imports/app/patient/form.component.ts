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

        this.call("patients.findOne", patientId, (err, patient) => {
            if (err) {
                //console.log("error while fetching patient:", err);
                showAlert("Error while fetching patient record.", "danger");
                return;
            }
            this.patient = patient;
            this.patientForm = this.formBuilder.group({
            firstName: [patient.firstName, Validators.required],
            lastName: [patient.lastName, Validators.required],
            address: [patient.address, Validators.required],
            company: [patient.company, Validators.required],
            phoneNum: [patient.phoneNum, Validators.required]
            });
        });

      });
  }

  updatePatient(): void {
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
      
    }
  }

}