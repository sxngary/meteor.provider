import { Meteor } from 'meteor/meteor';
import { PatientAgreements } from "../../../both/collections/agreements.collection";

Meteor.publish('patientAgreements', function(patientId: string) {
        //console.log('sdsdsd',patientId);
        return PatientAgreements.find({patientId:patientId});
    });