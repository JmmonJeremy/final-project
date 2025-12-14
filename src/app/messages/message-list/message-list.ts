import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Message } from '../message.model';
import { MessageService } from '../message.service';
import { ContactService } from '../../contacts/contact.service';
// Victory Planner
import { Victory } from '../message.model';

@Component({
  selector: 'cms-message-list',
  standalone: false,
  templateUrl: './message-list.html',
  styleUrl: './message-list.css'
})
export class MessageList implements OnInit, OnDestroy {
  messages: Message[] = [];
  private messageSubscription: Subscription;
  // Victory Planner
  victories: Victory[] = [];
  private victorySubscription: Subscription;

  constructor(private messageService: MessageService, private contactService: ContactService) { }

  ngOnInit(): void {
    this.contactService.getContacts();
    this.messageService.getMessages();
    this.messageSubscription = this.messageService.messageChangedEvent
      .subscribe(
        (messages: Message[])=> {
          this.messages = messages;
        }
      )
    // Victory Planner
    this.messageService.getVictories();
    this.victorySubscription = this.messageService.victoryChangedEvent
      .subscribe(
        (victories: Victory[])=> {
          this.victories = victories;
        }
      )
  }
  
  onAddMessage(message: Message){
    this.messages.push(message);
  }

  // Victory Planner
  onAddVictory(victory: Victory){
    this.victories.push(victory);
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();  // Clean up
    // Victory Planner
    this.victorySubscription?.unsubscribe();
  }
}

