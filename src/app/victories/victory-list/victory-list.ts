import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Victory } from '../victory.model';
import { VictoryService } from '../victory.service';
import { DAYS_OF_WEEK } from '../../shared/constants';
import { VictoriesFilterPipe } from '../victories-filter-pipe';

@Component({
  selector: 'cms-victory-list',
  standalone: false,
  templateUrl: './victory-list.html',
  styleUrl: './victory-list.css'
})
export class VictoryList  implements OnInit, OnDestroy {
  victories: Victory[] = [];
  term: string; 

  private victorySubscription: Subscription;
  private victoriesFilterPipe = new VictoriesFilterPipe();

  constructor(private victoryService: VictoryService) { }

  ngOnInit(): void {
    this.victoryService.getVictories();
    this.victorySubscription = this.victoryService.victoryChangedEvent
      .subscribe(
        (victories: Victory[])=> {
          this.victories = victories;
        }
      )
  }
    
  setForAdding() {    
    this.victoryService.inAddButton = true; 
    this.victoryService.emptyDays = true;  // for setting off Warning display when New Victory opens with no day selected
    this.victoryService.notEmptyEditDay = "other"; // to turn off the spoof active day highlight when clicking New Victory with Detail or Edit pg open
  }

  getGroupedVictories() {
  const groups = {};
  // Start every day with empty array (so missing days appear)
  DAYS_OF_WEEK.forEach(day => groups[day] = []);
  // Apply the pipe filter HERE (before grouping) instead of in HTML @for loop
  const filtered = this.victoriesFilterPipe.transform(this.victories, this.term);
  // Place victories into the correct bucket
  for (const v of filtered) {
    if (groups[v.day]) {
      groups[v.day].push(v);
    }
  }
  // Convert to array for ngFor
  return DAYS_OF_WEEK.map(day => ({
    day,
    list: groups[day]
  }));
}

  onAddVictory(victory: Victory){
    this.victories.push(victory);
  }

  search(value: string) {
    this.term = value;
  }

  ngOnDestroy(): void {
    this.victorySubscription?.unsubscribe();
  }
}