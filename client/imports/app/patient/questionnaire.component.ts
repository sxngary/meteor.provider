import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { showAlert } from "../shared/show-alert";
import { PatientQuestionnaires } from '../../../../both/collections/questionnaires.collection';
import template from './questionnaire.component.html';

@Component({
    selector: 'patient-questionnaire',
    template,
    styles: []
})
@InjectUser("user")
export class PatientQuestionnaireComponent implements OnInit {
    questionnaireSub: Observable<any[]>;
    questionnaireList: any[];
    questionnaireSelected: String;
    assignQuestionnaires: Observable<any[]>;

    constructor(
        private route: ActivatedRoute,
        private ngZone: NgZone) { }

    ngOnInit() {
        this.questionnaireSub = Observable.create(observer => {
            Meteor.call("findAllQuestionnaires", (err, res) => {
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
        this.getQuestionnaire();

        this.route.params
            .map(params => params['patientId'])
            .subscribe(patientId => {
                MeteorObservable.subscribe('patientQuestionnaires', patientId).subscribe(() => {
                    console.log("set patient-agreement list");
                    this.assignQuestionnaires = PatientQuestionnaires.find({ patientId: patientId }).zone();
                });
            });
    }

    getQuestionnaire() {
        this.questionnaireSub.subscribe((res) => {
            this.ngZone.run(() => {
                this.questionnaireList = res;
            });
        }, err => {
            console.error(err);
        });
    }


    assignQuestionnaire(): void {
        var questionnaireId = this.questionnaireSelected;
        var providerId = Meteor.userId();
        this.route.params
            .map(params => params['patientId'])
            .subscribe(patientId => {
                //console.log(agreementId,'abc',providerId,'patientid:',patientId);

                let questionnaireTitle = jQuery("#questionnaireList option:selected").text();
                console.log(questionnaireTitle, 'questionnaireTitle');
                let questionnaireData = {
                    providerId,
                    patientId,
                    questionnaire: {
                        _id: questionnaireId,
                        title: questionnaireTitle
                    },
                    assignDate: new Date(),
                    action: 'pending',
                    status: true
                };
                console.log(questionnaireData, 'data');
                Meteor.call('assignQuestionnaire', questionnaireData, (err, res) => {
                    if (err) {
                        showAlert("Agreement not sent to patient.", "danger");
                    }
                    if (res) {
                        showAlert("Agreement sent to patient.", "success");
                    }
                });
            });
    }



}