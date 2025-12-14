import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { Message } from '../message.model';
import { ContactService } from '../../contacts/contact.service';
import { Contact } from '../../contacts/contact.model';

// Victory Planner
import { Victory } from '../message.model';

@Component({
  selector: 'cms-message-item',
  standalone: false,
  templateUrl: './message-item.html',
  styleUrl: './message-item.css'
})
export class MessageItem implements OnInit, OnDestroy{  
  @Input() message: Message;
  messageSender: string = '';
  private contactListSubscription: Subscription;

  constructor(private contactService: ContactService) {

  }

  ngOnInit(): void {
    // try to get the contact immediately
    const contact: Contact = this.contactService.getContactByMongoId(this.message.sender);
    if (contact) {
      this.messageSender = contact.name;      
    } else {
      // if contact not found, wait for contacts to load
      this.contactListSubscription = this.contactService.contactListChangedEvent
      .pipe(take(1))
      .subscribe((contacts: Contact[]) => {
        const loadedContact = contacts.find(c => c._id === this.message.sender);
        console.log("messageSender: ", loadedContact);
        if (loadedContact) {
          this.messageSender = loadedContact.name;
        }
      }); 
    }
  }

  ngOnDestroy(): void {
    this.contactListSubscription?.unsubscribe();  // Clean up if created
  }
}
