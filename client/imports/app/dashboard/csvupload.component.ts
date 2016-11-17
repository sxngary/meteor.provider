import { Component, OnInit } from "@angular/core";
import { Meteor } from "meteor/meteor";
import { upload } from '../../../../both/methods/csvs.methods';

import template from "./csvupload.html";

@Component({
    selector: "csv-upload",
    template
})

export class CsvUploadComponent implements OnInit {
    fileIsOver: boolean = false;
    uploading: boolean = false;
 
    constructor() {
    }
    
    fileOver(fileIsOver: boolean): void {
        this.fileIsOver = fileIsOver;
    }

    onFileDrop(file: File): void {
        startUpload(file);
    }

    onFileSelect(event) {
        var files = event.srcElement.files;
        console.log(files);
        startUpload(files[0]);
    }

    ngOnInit() {
    }
}

function startUpload(file: File): void {
    // check for previous upload
    if (this.uploading === true) {
        console.log("aleady uploading...");
        return;
    }
    
    // start uploading
    console.log('file uploading...');
    this.uploading = true;

    upload(file)
    .then((res) => {
        this.uploading = false;
        console.log("file upload done.")
        console.log("file id:", res._id);
        Meteor.call("csv.process", res._id, (err, res) => {
            if (err) {
                console.log("error in csv import:", err);
                return;
            }
            console.log("csv import done.");
        });
    })
    .catch((error) => {
        this.uploading = false;
        console.log(`error in file upload:`, error);
    });
}