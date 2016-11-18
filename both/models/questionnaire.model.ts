import { CollectionObject } from './collection-object.model';

export interface Questionnaire extends CollectionObject {
    title : string,
    strap : string,
    summary : string,
    helper : string,
    createdBy : Date,
    questions : Object
}

export interface PatientQuestionnaires extends CollectionObject {
    //title : string,
    //strap : string,
    //summary : string,
    //helper : string,
    //createdBy : Date,
    //questions : Object
}