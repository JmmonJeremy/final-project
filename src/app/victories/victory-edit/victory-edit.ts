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
  victory: Victory = new Victory('', 'Sat', 1, '');  // FIXED: Initialize to prevent undefined 
  editMode: boolean = false;    
  id: string;
  buttonState: 'default' | 'pressed' = 'default';
  savedRecently = false;
  addedRecently = false;
  victoriesForDay: Victory[] = []; 
  currentVictoryId: string;   
  inAddButton:boolean;  
  emptydays: boolean; 
  victories: Victory [] = [];  
  filteredVictories: Victory[] = []; // filtered from dropdown
  newVictoryText: string = ''; // bound to input
  addSuccess = false;
  selectedDay: DayOfWeek;
  
  private paramsSubscription: Subscription;  // Store outer subscription
  private subscription: Subscription;  // Store inner subscription
  private victorySubscription: Subscription;

  @ViewChild('victoryInput') victoryInputRef: ElementRef;   // Added to be able to clear the fields  
  @ViewChild('victoryField') victoryField: NgModel;
  daysOfWeek = DAYS_OF_WEEK;

  constructor(
    private victoryService: VictoryService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {          
    this.victoryService.getVictories();    
    this.victorySubscription = this.victoryService.victoryChangedEvent
      .subscribe(
        (victories: Victory[])=> {
          this.victories = victories;          
          this.filteredVictories = this.getUniqueVictories(this.victories); // start with full list of only unique 
          this.handleEditMode();  // NEW: Extracted to load data after victories   
        }
      );         
    this.emptydays = this.victoryService.emptyDays;
    this.inAddButton = this.victoryService.inAddButton;    
  }

  // NEW: Extracted method for handling edit/new logic (runs after data load)
  private handleEditMode(): void {
     this.paramsSubscription = this.route.params.subscribe((params: Params) => {
      this.selectedDay = params['day'];  // <-- this comes from /victories/:day
      this.id = params['id'];
      // Load victories (regardless of whether already loaded)
      if (this.victoryService.victories.length > 0) {
        this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
      } else {
        this.victorySubscription = this.victoryService.victoryChangedEvent.subscribe(() => {
          this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
        });

        this.victoryService.getVictories();
      }
    });
    console.log("!!!!EDIT STUFF: length, selectedDay, clickedDay", this.victoriesForDay.length, this.selectedDay); 
    if (!this.id || this.victoryService.inAddButton) {        
      // New victory mode
      // console.log('New mode');
      this.editMode = false;
      this.victory = new Victory('', this.selectedDay, 1, '');
      this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);    
      console.log("!!!!EDIT length: ", this.victoriesForDay.length, this.selectedDay); // this is messed up and delivering all of the victories
      this.victoryService.closeEditDay = true;   
      return;
    }

    // Edit mode
    // console.log('Edit mode for ID:', this.id, this.editMode);
    
    this.victoryService.victoryDetail = "true" + this.selectedDay['day'];  // Your flag logic
    // console.log("DETAIL VALUE:", this.victoryService.victoryDetail);

    if (this.victories.length > 0) {
      this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
      this.victoryService.notEmptyEditDay = this.selectedDay;
      console.log("!!!!EDIT length: ", this.victoriesForDay.length, this.selectedDay); // this is messed up and delivering all of the victories
      this.victoryService.closeEditDay = false;   
      this.loadVictoryForEdit();
    } else {
      // Fallback sub for rare case (data not loaded yet)
      this.subscription = this.victoryService.victoryChangedEvent.subscribe(() => {
        this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
        this.loadVictoryForEdit();
      });
    }
  }

  // NEW: Extracted to load victory for edit
  private loadVictoryForEdit(): void {
    this.originalVictory = this.victoryService.getVictory(this.id);
    if (!this.originalVictory) {
      console.warn('Victory not found; navigating back');
      this.router.navigate(['/victories']);
      return;
    }   
    this.victoryService.victoryDetail = "false" + this.originalVictory.day;
    // console.log("EDIT victoryDetail VALUE:", this.victoryService.victoryDetail); 
    // console.log("EDIT closeEditDay + notEmptyEditDay:", this.victoryService.closeEditDay, this.victoryService.notEmptyEditDay);  
    this.editMode = true;
    this.victory = JSON.parse(JSON.stringify(this.originalVictory));
    this.victoriesForDay = this.victoryService.getVictoriesByDay(this.originalVictory.day);
    this.currentVictoryId = this.originalVictory.id;
  }

  getUniqueVictories(victories: Victory[]): Victory[] {
  const seen = new Set<string>();
  return victories.filter(v => {
    if (seen.has(v.victory.toLowerCase())) return false; // skip duplicates (case-insensitive)
    seen.add(v.victory.toLowerCase());
    return true;
  });
}

// Filter victories as user types
filterVictories() {
  const term = this.newVictoryText.toLowerCase();
  this.filteredVictories = this.getUniqueVictories(this.victories.filter(v =>
    v.victory.toLowerCase().includes(term))
  );
}

// Handle drop event from victory-dropdown
onVictoryDropped(event: DndDropEvent) {
  const droppedVictory = event.data as Victory;
  if (!droppedVictory) return;
  // Write into your real input binding
  this.newVictoryText = droppedVictory.victory;
  this.filteredVictories = [];
}

onAddVictory(form: NgForm) {
  if (!this.newVictoryText || !this.victory.day) {
    return; // nothing to add or no day selected
  }
  // Build new victory object
  const newVictory: Victory = {
    id: 'To be added by victoryService method addVictory',    // Adjust if you're auto-generating
    day: this.victory.day,
    number: this.victory.number,
    victory: this.newVictoryText.trim()
  };
  // Save through service
  this.victoryService.addVictory(newVictory);
  // Reset UI values
  this.newVictoryText = '';
  form.resetForm();
  this.addSuccess = true;
  // Refresh the list on UI
  this.victories = this.victoryService.victories;  // FIXED: Use property !!!!!!!!!!!!!!!
  this.victoriesForDay = this.victoryService.getVictoriesByDay(this.victory.day);
  // this.currentVictoryId = this.victoriesForDay[0].id; //??????? What does this do ??????????? (not in onAddVictory method)
  // console.log("ADD VICTORY SPOT currentVictoryId: ", this.victoriesForDay[0].id);
  // console.log("ADD VICTORY SPOT");
  // Trigger Saved UI
  this.triggerAdded();
  // Trigger animation
  this.buttonState = 'pressed';
  // After animation duration, reset state
  setTimeout(() => {
    this.buttonState = 'default';
    (document.activeElement as HTMLElement)?.blur();
  }, 500); // duration should match your pressed->default transition
  // Optional feedback timeout
  setTimeout(() => (this.addSuccess = false), 2000);
}

  loadDayVictories() { 
    this.victoryService.emptyDays = false; // to close the Warning message from New Victory when opening without a day selected
    this.victoryService.closeEditDay = true;    
    this.victoriesForDay = this.victoryService.getVictoriesByDay(this.victory.day);
    this.victoryService.clickedDay = this.victory.day;
    var victories = this.victoriesForDay;     
    // If there are victories for this day → go to edit page
    if (victories && victories.length > 0) {  
      this.victoryService.editDayNavMode = true;
      this.victoryService.dayNavigation = victories[0].day;  // needed for spoofing active background in day navigation in edit page with victories   
      // this.victory = JSON.parse(JSON.stringify(victories[0])); 
      this.currentVictoryId = victories[0].id;  
      this.router.navigate(['/victories', victories[0].day, victories[0].id, 'edit']);
    } else {
      // If the day is empty → go to empty edit page to add a victory       
      this.victoryService.dayNavigation = "other";        
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

  incrementNumber() {
    this.victory.number = (this.victory.number || 1) + 1;
  }

  decrementNumber() {
    if (this.victory.number > 1) {
      this.victory.number--;
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

  private triggerAdded() {
    this.addedRecently = false;

    setTimeout(() => {
      this.addedRecently = true;

      setTimeout(() => {
        this.addedRecently = false;
      }, 2000);
    });
  }

  onSubmit(form: NgForm) {
    const value = form.value;
    if (this.editMode) {
      console.log("OnSave - EDIT VICTORY SPOT");
      // Update existing
      this.victory.day = value.day;
      this.victory.number = value.number;
      this.victory.victory = value.victory;
      this.victoryService.updateVictory(this.originalVictory, this.victory);
      // Refresh the list on UI
      // this.victories = this.victoryService.victories;  // FIXED: Use property !!!!!!!!!!!!!!!
      // this.victoriesForDay = this.victoryService.getVictoriesByDay(this.victory.day);
      this.currentVictoryId = this.originalVictory.id; // used to keep the edited victory loaded
    } else {
      // Add new
      this.victory = new Victory(
        'To be added by victoryService method addVictory',
        value.day,
        value.number,
        value.victory  
      ); 
      this.victoryService.addVictory(this.victory);   
      console.log("OnSave - ADD VICTORY SPOT");
    }
    // Clear & Refresh Start of victory Input 
    this.victoryField.control.setValue(''); // clear victory field
    this.victoryField.control.markAsUntouched(); // stop touched warning styles & message
    this.victoryField.control.markAsPristine(); // stop invalid styles 
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

  passOnClosedEditStatus() {
    this.victoryService.closeEditDay = true; 
    this.victoryService.editDayNavMode = false; 
  }

  onBack() {
    this.victoryService.resetVictoryDetail();  // NEW: Clear state
    if (!this.victory.victory) {
      this.router.navigate(['/victories']); 
    }
    else {
      this.router.navigate(['/victories/day', this.victory.day]); 
    }
  }

  onClose() {   
    this.victoryService.resetVictoryDetail();  // NEW: Clear state 
    this.router.navigate(['/victories']);  
  } 

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();  // NEW: Clean up inner sub
  }
}
