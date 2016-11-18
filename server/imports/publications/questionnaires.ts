import { Meteor } from 'meteor/meteor';
import { PatientQuestionnaires } from "../../../both/collections/questionnaires.collection";

Meteor.publish('patientQuestionnaires', function(patientId: string) {
        var assignQuestionnaire = PatientQuestionnaires.find({patientId:patientId});
        return assignQuestionnaire;
    });