import {Questionnaires, PatientQuestionnaires } from "../../both/collections/questionnaires.collection";
import {Questionnaire} from "../../both/models/questionnaire.model";
import {Meteor} from "meteor/meteor";


Meteor.methods({
    "findAllQuestionnaires": () => {
        var questonnaire = Questionnaires.collection.find().fetch();
        //console.log(questonnaire,'questionnaire collection');
        if (questonnaire) {
            return questonnaire;
        }else{
            return [];    
        }
    },
    
    "assignQuestionnaire": (data) => {
        var result = PatientQuestionnaires.insert(data);
        
        return result;
    },
    
});