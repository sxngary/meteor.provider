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
    "patients.insert": (data) => {
        // insert patient
        let patientId = Patients.collection.insert(data);
        //console.log("patientId:", patientId);

        // insert user
        data._id = patientId;
        Meteor.call("patients.insertUser", data);
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
        check(patient.firstName, String);
        if (! isValidName(patient.firstName)) {
            throw new Meteor.Error(`Invalid firstName ${patient.email}`);
        }
        check(patient.lastName, String);
        if (! isValidName(patient.firstName)) {
            throw new Meteor.Error(`Invalid lastName ${patient.lastName}`);
        }
        check(patient.email, String);
        if (! isValidEmail(patient.email) ) {
            throw new Meteor.Error(`Invalid email ${patient.email}`);
        }
        check(patient.dob, Date);
        check(patient.address, String);
        check(patient.phoneNum, String);
        if (! isValidPhone(patient.phoneNum)) {
            throw new Meteor.Error(`Invalid phoneNum ${patient.phoneNum}`);
        }
        check(patient.groupId, Number);
        check(patient.personalId, Number);
        check(patient.company, String);
        check(patient.insurer, String);
        check(patient.guarantor, String);

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
        let where = {"type": "patient", "status.isDeleted": false};
        if (typeof searchString === 'string' && searchString.length) {
            where["patient.firstName"] = {
                $regex: `.*${searchString}.*`,
                $options : 'i'
            };
        }

        _.extend(options, {
            fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        let cursor = Meteor.users.find(where, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "patients.findOne": (patientId: String): Patient => {
        return Patients.collection.findOne({_id: patientId});
    },
    "patients.update": (patientId: String, dataToUpdate: Object) => {
        // check patient row
        let patient = Patients.collection.findOne({_id: patientId});
        if (typeof patient == "undefined" || typeof patient._id == "undefined") {
            throw new Meteor.Error(403, "Invalid patientId passed.");
        }
        
        // update patient row
        Patients.collection.update({_id: patientId}, {$set: dataToUpdate});

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
        _.extend(user.patient, dataToUpdate);
        Meteor.users.update({_id: patient.userId, type: "patient"}, {$set: {patient: user.patient} });
        return;
    },
    "patient.sendInvite": (userId: string) => {
        // check user object
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
        Accounts.sendEnrollmentEmail(userId);
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