import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DndDropEvent } from 'ngx-drag-drop';
import { Subscription } from 'rxjs';

import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';

@Component({
  selector: 'cms-contact-edit',
  standalone: false,
  templateUrl: './contact-edit.html',
  styleUrl: './contact-edit.css'
})
export class ContactEdit implements OnInit {
  originalContact: Contact;
  contact: Contact;
  groupContacts: Contact[] = [];
  editMode: boolean = false;
  groupContactRepeat = false;
  currentContact = false;
  id: string;
  private subscription: Subscription;
  private paramsSubscription: Subscription;  // NEW: Store inner sub
  // Added for adding contacts through a drop-down menu - addition
  availableContacts: Contact[] = [];
  selectedContactId: string = '';

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log("HELLO!!!")
    // 1. Wait for contact list to load
    this.subscription = this.contactService.contactListChangedEvent.subscribe(
      (contactList: Contact[]) => {
        this.availableContacts = contactList;
        console.log("HELLO2!!!")

        // 2. NOW safe to read route params and set contact
        this.paramsSubscription = this.route.params.subscribe((params: Params) => {
          const id = params['id'];

          if (!id) {
            this.editMode = false;
            this.contact = null;
            this.groupContacts = [];
            this.updateAvailableGroupContacts();
            return;
          }

          // 3. Get contact from loaded list
          this.originalContact = this.contactService.getContact(id);
          if (!this.originalContact) {
            this.router.navigate(['/contacts']);
            return;
          }

          this.editMode = true;
          this.contact = JSON.parse(JSON.stringify(this.originalContact));

          // 4. NOW set groupContacts
          this.groupContacts = this.originalContact.group
            ? JSON.parse(JSON.stringify(this.originalContact.group))
            : [];

          // 5. NOW update dropdown
          this.updateAvailableGroupContacts();
        });
      }
    );

    // 6. Trigger load  ***Added for adding contacts through a drop-down menu - addition
    this.contactService.getContacts();
  }

  onSubmit(form: NgForm) {
    const value = form.value;    
      this.contact = new Contact(
        'To be added by contactService method updateContact or addContact',
        value.name,
        value.email,
        value.phone,
        value.imageUrl,
        this.groupContacts
      );      
      if (this.editMode) {
        this.contactService.updateContact(this.originalContact, this.contact);        
      } else {
        this.contactService.addContact(this.contact);        
      }
      this.router.navigate(['/contacts']);
  }

  onCancel() {
    this.router.navigate(['/contacts']);
  }

  isInvalidContact(newContact: Contact): boolean {
    if (!newContact) {  
      this.currentContact = false; 
      this.groupContactRepeat = false;       
      return true;
    }
    if (this.contact && newContact.id === this.contact.id) {
      this.groupContactRepeat = false; 
      this.currentContact = true;  
      return true;
    }
    for (let i = 0; i < this.groupContacts.length; i++) {
      if (newContact.id === this.groupContacts[i].id) {
        this.currentContact = false; 
        this.groupContactRepeat = true;         
        return true;
      }
    }
    this.currentContact = false; 
    this.groupContactRepeat = false;   
    return false;
  }
  
  addToGroup(event:  DndDropEvent): void {
    const selectedContact: Contact = event.data;
    // Prevent duplicates
    if (this.groupContacts.some(c => c.id === selectedContact.id)) {
      return;
    }
    // Prevent self
    if (this.contact?.id === selectedContact.id) {
      return;
    }
    this.groupContacts.push(selectedContact);
    this.updateAvailableGroupContacts(); // Refresh dropdown
    }

  onRemoveItem(index: number): void {
    if (index < 0 || index >= this.groupContacts.length) {
      return;
    }
    this.currentContact = false; 
    this.groupContactRepeat = false;   
    this.groupContacts.splice(index, 1);
    this.updateAvailableGroupContacts();  // Refresh available dropdown list to include the removed contact
  }

  // All below is added for adding contacts through a drop-down menu - addition *** except ngOnDestroy for unsubscribing
  updateAvailableGroupContacts(): void {
    // get all contacts and the IDs of the current group members
    const allContacts = this.contactService.contacts.slice().sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const groupContactIds = this.groupContacts.map((c) => c.id);
    // Get ID of the contact being edited (if any)
    const currentContactId = this.contact?.id;
    // filter out contacts already in the group or the contact being edited
    this.availableContacts = allContacts.filter((contact) => {
      return (
        contact.id !== currentContactId &&           // Not the contact being edited
        !groupContactIds.includes(contact.id)        // Not already in group
      );
    });
  }
 
  onAddContactToGroup() {
    if (!this.selectedContactId) {
      return;
    }
    const contactToAdd = this.contactService.getContact(this.selectedContactId);
    if (contactToAdd && !this.groupContacts.find(c => c.id === contactToAdd.id)) {
      this.groupContacts.push(contactToAdd);
      this.selectedContactId = ''; // reset selection
      this.updateAvailableGroupContacts(); // update available list
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();  // NEW: Clean up inner sub
  }
}
