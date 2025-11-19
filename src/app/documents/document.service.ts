import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Document } from './document.model';
import { MOCKDOCUMENTS } from './MOCKDOCUMENTS';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  documentListChangedEvent = new Subject<Document[]>();
  documentChangedEvent = new EventEmitter<Document[]>();
  documentSelectedEvent = new EventEmitter<Document>();
  documents: Document[] = [];
  documentsListClone: Document[];
  maxDocumentId: number;  

  constructor(private http: HttpClient) {
    // this.documents = MOCKDOCUMENTS;
    this.maxDocumentId = this.getMaxId();    
  }

  private sortDocuments() {
    this.documents.sort((a, b) => a.name.localeCompare(b.name));
    this.documentListChangedEvent.next(this.documents.slice());
  }

  getDocuments(): void {
    this.http.get<Document[]>('https://learning-demo-ce50f-default-rtdb.firebaseio.com/documents.json').subscribe({
      // Success callback
      next: (documents: Document[]) => {        
        this.documents = documents;
        console.log('Documents loaded:', this.documents);
        this.maxDocumentId = this.getMaxId();
        this.documents.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        this.documentListChangedEvent.next(this.documents.slice());
      },
      // Error callback
      error: (error: any) => {
        console.error('Error loading documents:', error);
      }
    });     
  }
  
  storeDocuments(): void {    
    const data = JSON.stringify(this.documents);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    this.http
      .put('https://learning-demo-ce50f-default-rtdb.firebaseio.com/documents.json', data, { headers })
      .subscribe({
        next: () => {
          this.documentListChangedEvent.next(this.documents.slice());
        },
        error: (err) => {
          console.error('storeDocuments() failed:', err);
        }
      });
  }

  getDocument(id: string): Document {     
    for (let document of this.documents) {
      if (document.id === id) {
        return document;
      }
    }
    return null;
  }

  getMaxId(): number {
    let maxId = 0;
    for (const document of this.documents) {
      const currentId = parseInt(document.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

  addDocument(newDocument: Document){
    if (!newDocument){
      return;
    }
    this.maxDocumentId++;
    newDocument.id = this.maxDocumentId.toString();
    this.documents.push(newDocument);
    this.sortDocuments();
    this.documentsListClone = this.documents.slice();
    this.storeDocuments(); 
  }

  updateDocument(originalDocument: Document, newDocument: Document) {
    if (!originalDocument || !newDocument) {
      return;
    }
    const pos = this.documents.indexOf(originalDocument);
    if (pos < 0) {
      return;
    }
    newDocument.id = originalDocument.id;
    this.documents[pos] = newDocument;
    this.sortDocuments();
    this.documentsListClone = this.documents.slice();
    this.storeDocuments();
  }

  deleteDocument(document: Document) {
    if (!document) {
        return;
    }
    const pos = this.documents.indexOf(document);
    if (pos < 0) {
        return;
    }
    this.documents.splice(pos, 1);
    this.documentsListClone = this.documents.slice()
    this.storeDocuments();
  }

}
