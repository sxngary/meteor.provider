import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import {Agreement, PatientAgreement } from "../models/agreement.model";


export const Agreements = new MongoObservable.Collection<Agreement>("agreements");

export const PatientAgreements = new MongoObservable.Collection<PatientAgreement>('patient_agreements');

//
//function loggedIn(userId) {
//  return !!userId;
//}
// 