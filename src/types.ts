export interface Inbox {
  id: string;
  email: string;
  createdAt: any; // Firestore Timestamp
  expiresAt: any; // Firestore Timestamp
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}
