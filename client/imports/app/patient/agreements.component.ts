import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { MeteorObservable } from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { showAlert } from "../shared/show-alert";
import { Subscription } from 'rxjs/Subscription';
import template from './agreements.component.html';
import {PatientAgreements} from "../../../../both/collections/agreements.collection";


@Component({
  selector: 'patient-agreement',
  template,
  styles: [ ]
})
@InjectUser("user")
export class PatientAgreementComponent implements OnInit {
  agreementSelected: String;
  agreement: any[];
  patientAgree : Observable<any[]>;
  agreementList: Observable<any[]>;
  agreementSub: Subscription;

  constructor(
    private route: ActivatedRoute, 
    private ngZone: NgZone
  ) {}

    ngOnInit() {
        this.agreementList = Observable.create(observer => {
            Meteor.call("findAllAgreements", (err, res)=> {
                if (err) {                   
                    observer.error(err);
                } else {
                    observer.next(res);
                    observer.complete();
                }
            });
            //return () => {              
            //    console.log("agreementList unsubscribed")
            //};
        });
        this.getAgreement();
        
        this.route.params
            .map(params => params['patientId'])
            .subscribe(patientId => {
               this.agreementSub =  MeteorObservable.subscribe('patientAgreements',patientId).subscribe(() => {
                    //console.log("set patient-agreement list");
                    this.patientAgree = PatientAgreements.find({patientId:patientId}).zone();
                });
        });
    }
    
    ngOnDestroy() {
        this.agreementSub.unsubscribe();
    }

    getAgreement() {
        this.agreementList.subscribe((res) => {
            this.ngZone.run(() => {
                this.agreement = res;
            });
        }, err =>{
            console.error(err);
        });
    }
    
    sendAgreement():void{
        var agreementId = this.agreementSelected;
        var providerId = Meteor.userId();
        if (agreementId) {
            this.route.params
            .map(params => params['patientId'])
            .subscribe(patientId => {
                let agreementTitle = jQuery("#agreementList option:selected").text();
                let agreementData = {
                    providerId,
                    patientId,
                    agreement: {
                        _id: agreementId,
                        title: agreementTitle
                    },
                    assignDate : new Date(),
                    action : 'Pending',
                    status : true
                };
                Meteor.call('sendAgreement',agreementData,(err,res)=>{
                    if(err){
                        showAlert("Agreement not sent to patient.", "danger");
                    }
                    if (res) {
                        showAlert("Agreement sent to patient.", "success");
                    }
                });
            });
        }else{
            showAlert("Please select the agreement.", "danger");
        }
        
    }

    //getAgreementName(agreementId) {
    //    console.log("inside getAgreementName");
    //}

}