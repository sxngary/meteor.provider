import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import {PatientListComponent} from "./list.component";
import {PatientFormComponent} from "./form.component";
import {PatientDetailsComponent} from "./details.component";
import {PatientQuestionnaireComponent} from "./questionnaire.component";
import {PatientAgreementComponent} from "./agreements.component"


export const routes = [
    { path: 'patients/list', component: PatientListComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/edit/:patientId', component: PatientFormComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/details/:patientId', component: PatientDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/questionnaire/:patientId', component: PatientQuestionnaireComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/agreements/:patientId', component: PatientAgreementComponent, canActivate: ['canActivateForLoggedIn']},
]
