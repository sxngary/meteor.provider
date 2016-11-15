import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import {Questionnaire} from "../models/questionnaire.model";


export const Questionnaires = new MongoObservable.Collection<Questionnaire>("questionnaires");

//
//function loggedIn(userId) {
//  return !!userId;
//}
// 