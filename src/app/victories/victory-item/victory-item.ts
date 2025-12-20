import { AfterContentChecked, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { Victory } from '../victory.model';
import { DayOfWeek } from '../../shared/constants';
import { VictoryService } from '../victory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cms-victory-item',
  standalone: false,
  templateUrl: './victory-item.html',
  styleUrl: './victory-item.css'
})
export class VictoryItem implements AfterContentChecked, OnChanges, OnDestroy {
  notEmptyEditDay: string;
  closeEditDay: boolean;
  editDayNavMode: boolean;
  dayNavigation: string;
  victoryDetail: string;
  clickedDay: string;

  @Input() day: DayOfWeek;
  @Input() victories: Victory[];

  private stateSub: Subscription;  // NEW: For state changes

  constructor(private victoryService: VictoryService) { }

  ngOnChanges(changes: SimpleChanges): void {  // FIXED: Replaces AfterContentChecked—runs on @Input change
    if (changes['day'] || changes['victories']) {
      this.updateState();  // Re-check on input change
    }
  }

  ngOnDestroy(): void {  // NEW: Clean up sub
    this.stateSub?.unsubscribe();
  }

  private updateState(): void {
    this.dayNavigation = this.victoryService.dayNavigation;
    this.editDayNavMode = this.victoryService.editDayNavMode;
    this.victoryDetail = this.victoryService.victoryDetail;
    this.clickedDay = this.victoryService.clickedDay;   
    // console.log("Item updateState victoryDetail: ", this.victoryDetail); 
  }

  // NEW: Sub to state changes for re-evaluation
  private subscribeToStateChanges(): void {
    this.stateSub = this.victoryService.stateChanged$.subscribe(() => {
      this.updateState();  // Re-check condition on reset
    });
  }

  // Call in ngOnInit or constructor if needed
  ngOnInit(): void {
    this.subscribeToStateChanges();  // NEW: Listen for resets
    this.updateState();  // Initial
  }


  ngAfterContentChecked(): void {
    this.dayNavigation = this.victoryService.dayNavigation;
    this.editDayNavMode = this.victoryService.editDayNavMode;
    this.victoryDetail = this.victoryService.victoryDetail;   
    // console.log("Item AfterContent dayNavigation: ",this.victoryService.dayNavigation); 
  }

  getRouteForDay(): any[] {
    this.victoryDetail = this.victoryService.victoryDetail;   
    // If there are victories for this day → go to detail page
    if (this.victories && this.victories.length > 0) {        
      this.closeEditDay = this.victoryService.closeEditDay;
      this.notEmptyEditDay = this.victoryService.notEmptyEditDay; // recieves definition of day other - which in Add Victory is other           
      return ['/victories/day', this.victories[0].day];
    } else {
    this.closeEditDay = this.victoryService.closeEditDay;   
    }
    return ['/victories/day', this.day || 'new', 'edit'];
  }

  addingModeOff() {
    // console.log("!!!ITEM inAddButton Before: ",this.victoryService.inAddButton); 
    this.clickedDay = "no"; // sets variable to day clicked
    if (this.victories && this.victories.length > 0) {
      this.clickedDay = this.victories[0].day; // sets variable to day clicked
    }
    // console.log("!!!ITEM closedEditDay: ", this.victoryService.closeEditDay);
    this.victoryService.inAddButton = false; // gets set to true in Detail with Edit button if has victories 
     // If the day is empty → go to edit page
    if (this.clickedDay === "no" ) {
        this.victoryService.inAddButton = true; 
      };  
    // console.log("!!!ITEM inAddButton Before: ",this.victoryService.inAddButton); 
    this.victoryService.emptyDays = false; // to stop Warning message for day not being selected if opening after pushing New Victory 
    // to turn off the spoof active day highlight when clicking New Victory, then selecting a Day in the add page, then clicking day from list
    this.victoryService.editDayNavMode = false;     
    this.victoryService.dayNavigation ="ok"; 

  }
}