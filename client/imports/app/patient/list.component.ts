import { Meteor } from "meteor/meteor";
import {Component, OnInit, OnDestroy, NgZone, AfterViewInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {PaginationService} from "ng2-pagination";
import {MeteorObservable} from "meteor-rxjs";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {MeteorComponent} from 'angular2-meteor';

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

export class PatientListComponent extends MeteorComponent implements OnInit, OnDestroy {

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

    constructor(private paginationService: PaginationService, private ngZone: NgZone) {
        super();
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

            //console.log("options:", options);
            this.call("patients.find", options, searchString, (err, res) => {
                //console.log("patients.find() done");
                if (err) {
                    console.log("error while fetching patient list:", err);
                    return;
                }
                this.patients = res.data;
                this.patientsSize = res.count;
                this.paginationService.setTotalItems(this.paginationService.defaultId, this.patientsSize);
            })

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

    }

    search(value: string): void {
        this.searchString.next(value);
    }

    onPageChanged(page: number): void {
        this.curPage.next(page);
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
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