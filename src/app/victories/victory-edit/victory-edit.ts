import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DndDropEvent } from 'ngx-drag-drop';
import { Subscription } from 'rxjs';

import { Victory } from '../victory.model';
import { VictoryService } from '../victory.service';
import { DAYS_OF_WEEK, DayOfWeek } from '../../shared/constants';

@Component({
  selector: 'cms-victory-edit',
  standalone: false,
  templateUrl: './victory-edit.html',
  styleUrl: './victory-edit.css',
  animations: [
  trigger('pressRelease', [
    state('default', style({
      transform: 'scale(1)',
      boxShadow: 'none'
    })),
    state('pressed', style({
      transform: 'scale(0.97)',
      boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.2)'
    })),
    transition('default => pressed', [
      animate('100ms ease-in')
    ]),
    transition('pressed => default', [
      animate('200ms ease-out')
    ])
  ])
]  
})
export class VictoryEdit implements OnInit, OnDestroy {
  originalVictory: Victory;
  victory: Victory; 
  editMode: boolean = false;    
  id: string;
  buttonState: 'default' | 'pressed' = 'default';
  savedRecently = false;
  victoriesForDay: Victory[] = []; 
  currentVictoryId: string;         
  
  private paramsSubscription: Subscription;  // Store outer subscription
  private subscription: Subscription;  // Store inner subscription

  @ViewChild('victoryInput') victoryInputRef: ElementRef;   // Added to be able to clear the fields 
  dayFromRoute: DayOfWeek;
  @ViewChild('victoryField') victoryField: NgModel;
  daysOfWeek = DAYS_OF_WEEK;

  constructor(
    private victoryService: VictoryService,
    private router: Router,
    private route: ActivatedRoute) {}

ngOnInit(): void {
    this.paramsSubscription = this.route.params.subscribe((params: Params) => {
      this.dayFromRoute = params['day'];

      if (!params['id']) {
        // New victory mode
        this.editMode = false;
        this.victory = new Victory('', this.dayFromRoute, 1, '');
        this.victoriesForDay = this.victoryService.getVictoriesByDay(this.dayFromRoute);
        return;
      }

      // Edit mode
      this.id = params['id'];

      if (this.victoryService.victories && this.victoryService.victories.length > 0) {
        this.originalVictory = this.victoryService.getVictory(this.id);
        if (!this.originalVictory) {
          console.warn('Victory not found in memory; navigating back');
          this.router.navigate(['/victories']);
          return;
        }
        this.editMode = true;
        this.victory = JSON.parse(JSON.stringify(this.originalVictory));
        this.victoriesForDay = this.victoryService.getVictoriesByDay(this.victory.day);
        this.currentVictoryId = this.victory.id;
        return;
      }

      // Load from service if not already loaded
      this.subscription = this.victoryService.victoryChangedEvent.subscribe(() => {
        this.originalVictory = this.victoryService.getVictory(this.id);
        if (!this.originalVictory) {
          console.warn('Victory not found after load; navigating back');
          this.router.navigate(['/victories']);
          return;
        }
        this.editMode = true;
        this.victory = JSON.parse(JSON.stringify(this.originalVictory));
        this.victoriesForDay = this.victoryService.getVictoriesByDay(this.victory.day);
        this.currentVictoryId = this.victory.id;
      });

      this.victoryService.getVictories();
    });
  }

  loadDayVictories() {
    this.victoriesForDay = this.victoryService.getVictoriesByDay(this.victory.day);
    var victories = this.victoriesForDay; 
    // If there are victories for this day → go to edit page
    if (victories && victories.length > 0) {
      this.router.navigate(['/victories', victories[0].day, victories[0].id, 'edit']);           
      this.victory = JSON.parse(JSON.stringify(victories[0]));     
    } else {
      // If the day is empty → go to empty edit page to add a victory
      this.router.navigate(['/victories/day', this.victory.day || 'new', 'edit']);
    }
  }  

  onSelectVictory() {
    const selected = this.victoriesForDay.find(v => v.id === this.currentVictoryId);
    if (selected) {
      this.originalVictory = selected;
      this.victory = JSON.parse(JSON.stringify(selected)); // load into form     
      this.router.navigate(['/victories', this.victory.day, this.currentVictoryId, 'edit'], { replaceUrl: true });
    }
  }

  onClear(){   
    this.victoryInputRef.nativeElement.value = "";  
    this.victoryField.control.setValue('');
    this.victoryField.control.markAsTouched();    
  }

  private triggerSaved() {
  this.savedRecently = false;

  setTimeout(() => {
    this.savedRecently = true;

    setTimeout(() => {
      this.savedRecently = false;
    }, 2000);
  });
}

  onSubmit(form: NgForm) {
    const value = form.value;
    if (this.editMode) {
      // Update existing
      this.victory.day = value.day;
      this.victory.number = value.number;
      this.victory.victory = value.victory;

      this.victoryService.updateVictory(this.originalVictory, this.victory);
      this.currentVictoryId = this.originalVictory.id;
    } else {
      // Add new
      this.victory = new Victory(
        'To be added by victoryService method updateVictory or addVictory',
        value.day,
        value.number,
        value.victory  
      ); 
      this.victoryService.addVictory(this.victory);
      this.currentVictoryId = this.victory.id;
    }
    // Trigger Saved UI
    this.triggerSaved();
    // Trigger animation
    this.buttonState = 'pressed';
    // After animation duration, reset state
    setTimeout(() => {
      this.buttonState = 'default';
      (document.activeElement as HTMLElement)?.blur();
    }, 500); // duration should match your pressed->default transition
  }

  onClose() {
    this.router.navigate(['/victories']);  
  } 

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();  // NEW: Clean up inner sub
  }
}
