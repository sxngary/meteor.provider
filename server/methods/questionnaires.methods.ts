import {Questionnaires} from "../../both/collections/questionnaires.collection";
import {Questionnaire} from "../../both/models/questionnaire.model";
import {Meteor} from "meteor/meteor";


Meteor.methods({
    "findAllQuestionnaires": () => {
        var quest = Questionnaires.collection.find().fetch();
        console.log(quest,'questionnaire collection');
        return Questionnaires.collection.find().fetch();
    },
    //"patients.findOne": (patientId: String): Patient => {
    //    return Patients.collection.findOne({_id: patientId});
    //},
});