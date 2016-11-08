import {Meteor} from "meteor/meteor";
import {CsvsStore, Csvs} from "../../both/collections/csvs.collection";
//import "./patients.methods";

let csv = require('csv-parser');
let fs = require('fs');

Meteor.methods({
    "csv.process": (fileId: string) => {
        // find and match csv file in local db
        let csvItem = Csvs.collection.findOne({_id: fileId});
        if (typeof csvItem == "undefined" || csvItem._id !== fileId) {
            throw new Meteor.Error(`Invalid fileId ${fileId}`);
        }

        // update file processing status in db
        Csvs.collection.update({_id: fileId}, {$set: {
            "stats.isPending": false,
            "stats.isProcessing": true,
            "stats.startedAt": new Date()
        } });

        let filepath = CsvsStore.getFilePath(fileId);
        console.log("filepath:", filepath);

        let totalNum = 0, successNum = 0, failedNum = 0;

        fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', Meteor.bindEnvironment(function (data) {
            let insertPatient = Meteor.wrapAsync(function(data, fileId){
                try {
                    totalNum++;
                    successNum++;
                    console.log(`insert patient "${data.firstName} ${data.lastName}"`);

                    data.csvId = fileId;
                    data.groupId = Number(data.groupId);
                    data.personalId = Number(data.personalId);
                    data.dob = new Date(data.dob);
                    
                    Meteor.call("patients.insert", data);
                } catch (e) {
                    successNum--;
                    failedNum++;
                    console.log("error calling insert patient");
                    console.log(e.message);
                }
            });
            insertPatient(data, fileId);
        }))
        .on('end', Meteor.bindEnvironment(function () {
            // update file processing status in db
            Csvs.collection.update({_id: fileId}, {$set: {
                "stats.isProcessing": false,
                "stats.isCompleted": true,
                "stats.completedAt": new Date(),
                "stats.total": totalNum,
                "stats.success": successNum,
                "stats.failed": failedNum
            } });
        }));
    }
})