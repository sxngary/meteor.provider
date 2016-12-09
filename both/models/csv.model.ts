import { CollectionObject } from './collection-object.model';

export interface Csv extends CollectionObject {
    stats: {
        total: number;
        processed: number;
        success: number;
        failed: number;
        isProcessing: boolean;
        isPending: boolean;
        isCompleted: boolean;
        startedAt: Date;
        completedAt: Date;
    }
}

export interface Patient extends CollectionObject {
    csvId: string;
    firstName: string;
    lastName: string;
    dob: Date;
    email: string;
    ssn: string;
    gender: string;
    address: string;
    phoneNum: string;
    groupId: string;
    personalId: string;
    company: string;
    insurer: string;
    guarantor: string;
    providerId: string;
    accessCode?: string;
    userId?: string;
    status?: {
        isDeleted: boolean;
    };
}