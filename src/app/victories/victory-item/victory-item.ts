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
    console.log("Item updateState victoryDetail: ", this.victoryDetail); 
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
    console.log("Item AfterContent victoryDetail: ",this.victoryService.victoryDetail); 
  }

  getRouteForDay(): any[] {
    this.victoryDetail = this.victoryService.victoryDetail;
    console.log("Before victoryDetail: ",this.victoryService.victoryDetail); 
    // If there are victories for this day → go to detail page
    if (this.victories && this.victories.length > 0) {
      this.closeEditDay = this.victoryService.closeEditDay;       
      this.notEmptyEditDay = this.victoryService.notEmptyEditDay;           
      return ['/victories/day', this.victories[0].day];

    }  
    
    // If the day is empty → go to edit page
    this.notEmptyEditDay = "other";
    return ['/victories/day', this.day || 'new', 'edit'];
  }

  addingModeOff() {
    this.victoryService.inAddButton = false; 
    this.victoryDetail = this.victoryService.victoryDetail;
     console.log("addingModeOff Method victoryDetail: ",this.victoryDetail); 
     console.log("Service victoryDetail: ",this.victoryService.victoryDetail);
     if (!this.victories) {console.log("!!!!!!!!!!!!!!THIS DAY", this.day);} 
     this.victories.forEach(victory => {
        console.log("!!!!!!!!!!!!!!FOREACH DAY", victory.day);
        console.log("!!!!!!!!!!!!!!FOREACH LENGTH", this.victories.length);
     });
  }
}