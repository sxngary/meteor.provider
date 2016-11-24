import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MeteorComponent} from 'angular2-meteor';
import { Patient } from "../../../../both/models/csv.model";
import template from './details.component.html';
import {showAlert} from "../shared/show-alert";

@Component({
  selector: '',
  template
})
@InjectUser("user")
export class PatientDetailsComponent extends MeteorComponent implements OnInit {
  patientSub: Observable<any[]>;  
  patientId: string;
  patient: Patient;
  paramsSub: Subscription;

  constructor(
    private route: ActivatedRoute, 
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
    
            this.call("patients.findOne", patientId, (err, res)=> {
                if (err) {
                    //console.log("error while fetching patient data:", err);
                    showAlert("Error while fetching patient data.", "danger");
                    return;
                }
                this.patient = res;
            });

        });
  }

}