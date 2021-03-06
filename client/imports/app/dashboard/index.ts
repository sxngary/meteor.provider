import {DashboardComponent} from "./dashboard.component";
import {CsvUploadComponent} from "./csvupload.component";
import {PatientListComponent} from "../patient/list.component";
import {PatientFormComponent} from "../patient/form.component";
import {PatientDetailsComponent} from "../patient/details.component";
import {PatientQuestionnaireComponent} from "../patient/questionnaire.component";
import {PatientAgreementComponent} from "../patient/agreements.component";
import {LandingComponent} from "../layout/landing.component";

export const DASHBOARD_DECLARATIONS = [
    DashboardComponent,
    CsvUploadComponent,
    PatientListComponent,
    PatientFormComponent,
    PatientDetailsComponent,
    PatientQuestionnaireComponent,
    PatientAgreementComponent,
    LandingComponent
]