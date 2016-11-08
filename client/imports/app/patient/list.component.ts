import { Meteor } from "meteor/meteor";
import {Component, OnInit, OnDestroy, NgZone, AfterViewInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {PaginationService} from "ng2-pagination";
import {MeteorObservable} from "meteor-rxjs";
import {InjectUser} from "angular2-meteor-accounts-ui";

import template from "./list.component.html";

interface Pagination {
  limit: number;
  skip: number;
}
 
interface Options extends Pagination {
  [key: string]: any
}

@Component({
    selector: "patient-list",
    template
})

export class PatientListComponent implements OnInit, OnDestroy {

    patientsSub: Observable<any[]>;
    patients: any[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    patientsSize: number = 0;
    patientsSizeSub: Observable<number>;
    //autorunSub: Subscription;
    searchString: Subject<string> = new Subject<string>();
    user: Meteor.User;
    paginationService: PaginationService;

    constructor(paginationService: PaginationService, private ngZone: NgZone) {
        this.paginationService = paginationService;
    }

    ngOnInit() {
        this.optionsSub = Observable.combineLatest(
            this.pageSize,
            this.curPage,
            this.nameOrder,
            this.searchString
        ).subscribe(([pageSize, curPage, nameOrder, searchString]) => {
            const options: Options = {
                limit: pageSize as number,
                skip: ((curPage as number) - 1) * (pageSize as number),
                sort: { "patient.firstName": nameOrder as number }
            };

            this.paginationService.setCurrentPage(this.paginationService.defaultId, curPage as number);

            if (this.patients) {
                this.patients = null;
            }

            this.patientsSub = Observable.create(observer => {
                Meteor.call("patients.find", options, searchString, (err, res)=> {
                    if (err) {                   
                        observer.error(err);
                    } else {
                        console.log("patients.find:", res);
                        // reset pagination
                        this.patientsSize = res.count;
                        this.paginationService.setTotalItems(this.paginationService.defaultId, this.patientsSize);
                        // reset data
                        observer.next(res.data);
                        observer.complete();
                    }
                });

                return () => {              
                    console.log("patientsSub unsubscribed")
                };
            });

        });

        this.paginationService.register({
        id: this.paginationService.defaultId,
        itemsPerPage: 10,
        currentPage: 1,
        totalItems: this.patientsSize
        });

        this.pageSize.next(10);
        this.curPage.next(1);
        this.nameOrder.next(1);
        this.searchString.next('');
        this.patientsSize = 0;

        /*this.autorunSub = MeteorObservable.autorun().subscribe(() => {
        //this.paginationService.setTotalItems(this.paginationService.defaultId, this.patientsSize);
        });*/

        this.getPatients();
    }

    getPatients() {
        this.nameOrder.next(parseInt(document.getElementById("sortOrder").value) );
        this.patientsSub.subscribe(patients => {

            this.ngZone.run(() => {
                this.patients = patients;
            });

        }, err =>{
            console.error(err);
        });
    }

    search(value: string): void {
        this.curPage.next(1);
        this.searchString.next(value);
        this.getPatients();
    }

    onPageChanged(page: number): void {
        this.curPage.next(page);
        this.getPatients();
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
        this.getPatients();
    }

    sendInvite(user: any) {
        Meteor.call("patient.sendInvite", user._id, (err, res) => {
            if (err) {
                console.log("error calling patient.sendInvite");
                return;
            }
            alert("Invite sent to Patient.")
        })
    }

    ngOnDestroy() {
        this.optionsSub.unsubscribe();
        //this.autorunSub.unsubscribe();
    }

    ngAfterViewInit() {
        jQuery(function($){
        $('select').material_select();
        })
    }
}