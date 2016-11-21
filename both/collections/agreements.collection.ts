import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import {Agreement, PatientAgreements } from "../models/agreement.model";


export const Agreements = new MongoObservable.Collection<Agreement>("agreements");

export const PatientAgreements = new MongoObservable.Collection<PatientAgreements>('patient_agreements');

//
//function loggedIn(userId) {
//  return !!userId;
//}
// 