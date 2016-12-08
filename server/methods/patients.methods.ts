import {Patients} from "../../both/collections/csvs.collection";
import {Patient} from "../../both/models/csv.model";
import {Meteor} from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import {check} from "meteor/check";
import {Email} from "meteor/email";
import {isValidEmail, isValidName, isValidPhone} from "../../both/validators";

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "patients.validate": function(data) {
        // apply validations
        check(data.firstName, String);
        if (! isValidName(data.firstName)) {
            throw new Meteor.Error(`Invalid firstName ${data.email}`);
        }
        check(data.lastName, String);
        if (! isValidName(data.firstName)) {
            throw new Meteor.Error(`Invalid lastName ${data.lastName}`);
        }
        check(data.email, String);
        if (! isValidEmail(data.email) ) {
            throw new Meteor.Error(`Invalid email ${data.email}`);
        }
        // convert date to date type explicitly
        data.dob = new Date(data.dob);
        check(data.dob, Date);
        check(data.address, String);
        check(data.phoneNum, String);
        if (! isValidPhone(data.phoneNum)) {
            throw new Meteor.Error(`Invalid phoneNum ${data.phoneNum}`);
        }
        check(data.groupId, String);
        check(data.personalId, String);
        check(data.company, String);
        check(data.insurer, String);
        check(data.guarantor, String);

        return true;
    },
    "patients.insert": (data) => {
        // validate data
        if (! Meteor.call("patients.validate", data)) {
            throw new Meteor.Error(403, `Invalid data supplied.`);
        }

        // insert patient
        data.providerId = Meteor.userId();
        data.status = {
            isDeleted: false
        };
        let patientId = Patients.collection.insert(data);
        //console.log("patientId:", patientId);

        // insert user
        /*data._id = patientId;
        Meteor.call("patients.insertUser", data);*/
        return;
    },
    "patients.insertUser": (patientId: any) => {
        let patient:Patient = null;

        // find patient row
        if (typeof patientId == "string") {
            patient = Patients.collection.findOne({_id: patientId, userId: {$exists: false} });
        } else if (typeof patientId == "object" && typeof patientId._id == "string") {
            patient = patientId;
            patientId = patient._id;
        }

        // throw error if patient is invalid
        if (typeof patient !== "object" || typeof patient._id !== "string") {
            throw new Meteor.Error(403, "Invalid patientId passed.");
        }

        // apply validations
        check(patient.csvId, String);
        
        // prepare user-data before insertion
        let userData:any = {};
        userData.type = "patient";
        userData.email = patient.email;
        // save password as reverse of name in email-id. for example, test@example.com => tset
        userData.password = patient.email.substring(0, patient.email.lastIndexOf("@")).split("").reverse().join("");
        userData.patient = patient;
        userData.status = {
            isActive: true,
            isClaimed: false,
            isDeleted: false,
            isInvited: false
        };
        userData.invites = [];
        
        // now insert user
        let user = Meteor.call("createUser", userData);
        //console.log("inserted user:", user);

        // update userId into patient object
        if (user && user.id) {
            Patients.collection.update({_id: patientId}, {$set: {
                "userId": user.id
            }});
        }
    },
    "patients.find": (options: Options, searchString: String) => {
        let where:any = {
            $or: [{"status.isDeleted": false}, {"status.isDeleted": {$exists: false} }],
        };
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName, company name, address fields
            where["$or"] = [
                {
                    "firstName":
                    {
                    $regex: `.*${searchString}.*`,
                    $options : 'i'
                    }
                },
                {
                    "lastName":
                    {
                    $regex: `.*${searchString}.*`,
                    $options : 'i'
                    }
                },
                {
                    "company":
                    {
                    $regex: `.*${searchString}.*`,
                    $options : 'i'
                    }
                },
                {
                    "address":
                    {
                    $regex: `.*${searchString}.*`,
                    $options : 'i'
                    }
                }
            ]
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Patients.collection.find(where, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "patients.findOne": (patientId: String): Patient => {
        return Patients.collection.findOne({_id: patientId});
    },
    "patients.update": (patientId: String, dataToUpdate: any) => {
        // check patient row
        let patient = Patients.collection.findOne({_id: patientId});
        if (typeof patient == "undefined" || typeof patient._id == "undefined") {
            throw new Meteor.Error(403, "Invalid patientId passed.");
        }

        // validate data
        if (! Meteor.call("patients.validate", dataToUpdate)) {
            throw new Meteor.Error(403, `Invalid data supplied.`);
        }
        
        // update patient row
        dataToUpdate.dob = new Date(dataToUpdate.dob);
        Patients.collection.update({_id: patientId}, {$set: dataToUpdate});

        return;
    },
    
    //----send signup invitation to patient---------//
    "patient.sendInvite": (patientId: string) => {
        //console.log(patientId,'userId');
        let patientData = Patients.findOne({_id: patientId, "status.isDeleted":false});
        if (typeof patientData == "undefined" || typeof patientData._id == "undefined") {
            throw new Meteor.Error(403, "Invalid patientId passed.");
        }else{
            //console.log(patientData,'patientData');
            let accessCode = getAccessCode();
            if (accessCode) {
                let getCode = Patients.update({_id:patientData._id},{$set:{accessCode:accessCode}});
                if (getCode) {
                    return getCode;
                }else{
                    new Meteor.Error(403, "Invalid userId passed to patient.sendInvite()");
                    return;
                }
            }
        }  
        
       
       /* // check user object
        let user:any = Meteor.users.findOne({_id: userId, "type": "patient", "status.isClaimed": false});
        if (typeof user == "undefined") {
            new Meteor.Error(403, "Invalid userId passed to patient.sendInvite()");
            return;
        }

        // update user status, invite history
        if (typeof user.invites == "undefined") {
            user.invites = [];
        }
        if (typeof user.services.password.reset !== "undefined" && user.services.password.reset.reason == "enroll") {
            user.invites.push(user.services.password.reset);
        }
        Meteor.users.update({_id: userId}, {$set: {
            invites: user.invites,
            "status.isInvited": true
        } });

        // send email
        Accounts.sendEnrollmentEmail(userId);*/
    },
    
    
    "patient.remove": (patientId: String) => {
        // check patient row
        let patient = Patients.collection.findOne({_id: patientId});
        if (typeof patient == "undefined" || typeof patient._id == "undefined") {
            throw new Meteor.Error(403, "Invalid patientId passed.");
        }
        
        // update patient row
        if (typeof patient.status == "undefined") {
            patient.status = {
                isDeleted: true
            };
        } else {
            patient.status.isDeleted = true;
        }
        Patients.collection.update({_id: patientId}, {$set: {status: patient.status}});

        // check user reference
        if (typeof patient.userId == "undefined") {
            return;
        }

        // check user object
        let user:any = Meteor.users.findOne({_id: patient.userId});
        if (typeof user == "undefined") {
            return;
        }

        // update user profile
        if (typeof user.status == "undefined") {
            user.status = {
                isDeleted: true
            };
        } else {
            user.status.isDeleted = true;
        }
        Meteor.users.update({_id: patient.userId, type: "patient"}, {$set: {status: user.status} });
        return;
    }
})


//-------------comman function---------------//
function getAccessCode(){
    var accessCode='';
    var possible = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
    for( var i=0; i < 6; i++ ){
        accessCode += possible.charAt(Math.floor(Math.random() * possible.length));
    }    
    var checkUnique = Patients.find({accessCode:accessCode});
    if(checkUnique){
        if(checkUnique.length>0){
            getAccessCode();
        }else{
            return accessCode;
        }
    }else{
        return accessCode;
    }
}