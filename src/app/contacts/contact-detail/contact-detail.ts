import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Contact } from '../contact.model';
import { ContactService } from '../../contacts/contact.service';

@Component({
  selector: 'cms-contact-detail',
  standalone: false,
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.css'
})
export class ContactDetail implements OnInit, OnDestroy {
  contact: Contact;
  id: string;
  private paramsSubscription: Subscription;  // Store outer sub
  private contactListSubscription: Subscription;  // Store inner sub

  constructor(private contactService: ContactService,                          
              private route: ActivatedRoute,
              private router: Router) {  }

  ngOnInit(): void {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          // If contacts are already loaded, get immediately
          if (this.contactService.contacts.length > 0) {
            this.contact = this.contactService.getContact(this.id);
          } else {
              // Otherwise, wait until contacts are loaded
              this.contactListSubscription = this.contactService.contactListChangedEvent.subscribe(() => {
                this.contact = this.contactService.getContact(this.id);
              });
              // Trigger a load for refresh cases (where contactListChangedEvent isn't fired)
              this.contactService.getContacts();
            }
        } 
      );
  } 

  onDelete() {
    if (!this.contact) return;
    this.contactService.deleteContact(this.contact);
    this.router.navigateByUrl('/contacts');
  }

  ngOnDestroy(): void {  // Add this method
    this.paramsSubscription?.unsubscribe();  // Clean up outer
    this.contactListSubscription?.unsubscribe();  // Clean up inner (if created)
  }
}
