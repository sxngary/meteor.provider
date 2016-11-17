import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import {SignupComponent} from "./auth/singup.component";
import {RecoverComponent} from "./auth/recover.component";
import {LoginComponent} from "./auth/login.component.web";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {PatientListComponent} from "./patient/list.component";
import {PatientFormComponent} from "./patient/form.component";
import {PatientDetailsComponent} from "./patient/details.component";
import {PatientQuestionnaireComponent} from "./patient/questionnaire.component";
import {PatientAgreementComponent} from "./patient/agreements.component"
import {LandingComponent} from "./layout/landing.component";

export const routes: Route[] = [
    { path: 'dashboard', component: DashboardComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'recover', component: RecoverComponent },
    { path: 'patients/list', component: PatientListComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/edit/:patientId', component: PatientFormComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/details/:patientId', component: PatientDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/questionnaire/:patientId', component: PatientQuestionnaireComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'patients/agreements/:patientId', component: PatientAgreementComponent, canActivate: ['canActivateForLoggedIn']},
    { path: '', component: LandingComponent/*, canActivate: ['canActivateForLogoff']*/ }
];

export const ROUTES_PROVIDERS = [
    {
        provide: 'canActivateForLoggedIn',
        useValue: () => !! Meteor.userId()
    },
    {
        provide: 'canActivateForLogoff',
        useValue: () => ! Meteor.userId()
    },
];