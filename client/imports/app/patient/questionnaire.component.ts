import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
//import { Questionnaires } from '../../../../both/collections/questionnaires.collection';
import template from './questionnaire.component.html';

@Component({
  selector: 'patient-questionnaire',
  template,
  styles: [ ]
})
@InjectUser("user")
export class PatientQuestionnaireComponent implements OnInit {
    questinnaires: Observable<any[]>; 
  
    constructor(private ngZone: NgZone) {}
  
    ngOnInit() {
        this.questinnaires = Observable.create(observer => {
            Meteor.call("findAllQuestionnaires", (err, res)=> {
                if (err) {                   
                    observer.error(err);
                } else {
                    // reset data
                    //console.log(res,'res questionnaire');
                    observer.next(res);
                    observer.complete();
                }
            });
        });
        this.getPatient();
    }

    getPatient() {
        this.questinnaires.subscribe((res) => {
            this.ngZone.run(() => {
                this.testds = res;
            });
        }, err =>{
            console.error(err);
        });
    }

  

}