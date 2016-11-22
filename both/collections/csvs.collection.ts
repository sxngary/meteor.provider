import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import {Csv, Patient} from "../models/csv.model";

export const Csvs = new MongoObservable.Collection<Csv>("csvs");
export const Patients = new MongoObservable.Collection<Patient>("patients");


function loggedIn(userId) {
  return !!userId;
}
 
export const CsvsStore = new UploadFS.store.Local({
  collection: Csvs.collection,
  name: 'csvs',
  path: process.env.PWD + '/uploads/csvs',
  filter: new UploadFS.Filter({
    contentTypes: ['text/csv'],
    extensions: ['csv']
  }),
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
});
