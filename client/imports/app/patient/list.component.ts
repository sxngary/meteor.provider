import { Meteor } from "meteor/meteor";
import {Component, OnInit, OnDestroy, NgZone, AfterViewInit} from "@angular/core";
import {Observable, Subscription, Subject, BehaviorSubject} from "rxjs";
import {PaginationService} from "ng2-pagination";
import {MeteorObservable} from "meteor-rxjs";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {MeteorComponent} from 'angular2-meteor';
import { Patient } from "../../../../both/models/csv.model";
import { ChangeDetectorRef } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';
import {showAlert} from "../shared/show-alert";

import template from "./list.component.html";

interface Pagination {
  limit: number;
  skip: number;
}

declare var jQuery:any;

interface Options extends Pagination {
  [key: string]: any
}

@Component({
    selector: "patient-list",
    template
})

export class PatientListComponent extends MeteorComponent implements OnInit, OnDestroy {

    patients: Patient[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    patientsSize: number = 0;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";
    user: Meteor.User;

    constructor(private paginationService: PaginationService, 
    private ngZone: NgZone, 
    private changeDetectorRef: ChangeDetectorRef,
    private localStorageService: LocalStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.optionsSub = Observable.combineLatest(
            this.pageSize,
            this.curPage,
            this.nameOrder,
            this.searchSubject
        ).subscribe(([pageSize, curPage, nameOrder, searchString]) => {
            const options: Options = {
                limit: pageSize as number,
                skip: ((curPage as number) - 1) * (pageSize as number),
                sort: { "firstName": nameOrder as number }
            };
            this.localStorageService.set("patients-list.options", {
                pageSize: pageSize,
                curPage: curPage,
                nameOrder: nameOrder,
                searchString: searchString
            });

            this.paginationService.setCurrentPage(this.paginationService.defaultId, curPage as number);

            //console.log("options:", options);
            //console.log("searchString:", this.searchString);
            this.searchString = searchString;
            jQuery(".loading").show();
            this.call("patients.find", options, searchString, (err, res) => {
                //console.log("patients.find() done");
                jQuery(".loading").hide();
                if (err) {
                    //console.log("error while fetching patient list:", err);
                    showAlert("Error while fetching patient list.", "danger");
                    return;
                }
                this.patients = res.data;
                this.patientsSize = res.count;
                this.paginationService.setTotalItems(this.paginationService.defaultId, this.patientsSize);

                setTimeout(function(){
                    jQuery(function($){
                    $('.tooltipped').tooltip({delay: 0});
                    });
                }, 200);
            })

        });

        let options:any = this.localStorageService.get("patients-list.options");
        //console.log("patient-list.options:", options);

        if (!!options) {
            if (! options.limit) {
                options.limit = 10;
            } else {
                options.limit = Number(options.limit);
            }

            if (! options.curPage) {
                options.curPage = 1;
            } else {
                options.curPage = Number(options.curPage);
            }

            if (! options.nameOrder) {
                options.nameOrder = 1;
            } else {
                options.nameOrder = Number(options.nameOrder);
            }

            if (! options.searchString) {
                options.searchString = '';
            }
        } else {
            options = {
                limit: 10,
                curPage: 1,
                nameOrder: 1,
                searchString: '',
            }
        }

        this.paginationService.register({
        id: this.paginationService.defaultId,
        itemsPerPage: 10,
        currentPage: options.curPage,
        totalItems: this.patientsSize
        });

        this.pageSize.next(options.limit);
        this.curPage.next(options.curPage);
        this.nameOrder.next(options.nameOrder);
        this.searchSubject.next(options.searchString);
    }

    search(value: string): void {
        this.searchSubject.next(value);
    }

    onPageChanged(page: number): void {
        this.curPage.next(page);
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
    }

    //----send signup invitation to patient---------//    
    sendInvite(patient: Patient) {
        Meteor.call("patient.sendInvite", patient._id, (err, res) => {
            if (err) {
                //console.log("error calling patient.sendInvite");
                showAlert("Error calling patient.sendInvite", "danger");
                return;
            }else{
                //console.log(res,'res');
                showAlert("Invite sent to patient.", "success");
            }
        })
    }

    deletePatient(patient: Patient) {
        if (! confirm("Are you sure to delete this record?")) {
            return false;
        }

        Meteor.call("patient.remove", patient._id, (err, res) => {
            if (err) {
                //console.log("error calling patient.remove");
                showAlert("Error calling patient.remove", "danger");
                return;
            }
            //set patient isDeleted to true to remove from list
            patient.status.isDeleted = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("Patient has been removed.", "success");
        })
    }

    ngOnDestroy() {
        this.optionsSub.unsubscribe();
    }

    ngAfterViewInit() {
        jQuery(function($){
        $('select').material_select();
        $('.tooltipped').tooltip({delay: 50});
        })
    }
}