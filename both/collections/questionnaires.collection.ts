import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import {Questionnaire, PatientQuestionnaire} from "../models/questionnaire.model";


export const Questionnaires = new MongoObservable.Collection<Questionnaire>("questionnaires");

export const PatientQuestionnaires = new MongoObservable.Collection<PatientQuestionnaire>('patient_questionnaires');

//
//function loggedIn(userId) {
//  return !!userId;
//}
// 