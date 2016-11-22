import {Agreements, PatientAgreements} from "../../both/collections/agreements.collection";
import {Agreement} from "../../both/models/agreement.model";
import {Meteor} from "meteor/meteor";


Meteor.methods({
    
    "findAllAgreements": () => {
        var agreements = Agreements.collection.find({status:true,isDeleted:0}).fetch();
        //console.log(agreements,'Agreements collection');
        if (agreements) {
            return agreements;
        }else{
            return [];    
        }
        
    },
    
    "sendAgreement": (data) => {
        var result = PatientAgreements.insert(data);
        
        return result;
    },
});