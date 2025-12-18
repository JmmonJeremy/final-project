import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Victory } from '../victory.model';
import { VictoryService } from '../../victories/victory.service';
import { DayOfWeek } from "../../shared/constants";

@Component({
  selector: 'cms-victory-detail',
  standalone: false,
  templateUrl: './victory-detail.html',
  styleUrl: './victory-detail.css'
})
export class VictoryDetail implements OnInit, OnDestroy {
  victory: Victory | null = null;
  victoriesForDay: Victory[] = [];      // all victories for the same day
  selectedVictoryIds: string[] = [];        // store ids, not objects
  selectedDay: DayOfWeek;
  day: DayOfWeek;
  id: string;
  private paramsSubscription: Subscription;  // Store outer subscription
  private victoryListSubscription: Subscription;  // Store inner subscription

  constructor(private victoryService: VictoryService,                          
              private route: ActivatedRoute,
              private router: Router) {  }

  ngOnInit(): void {    
    this.paramsSubscription = this.route.params.subscribe((params: Params) => {
      this.selectedDay = params['day'];  // <-- this comes from /victories/:day
      this.victoryService.victoryDetail = "true" + params['day'];  
      console.log("DETAIL VALUE:", this.victoryService.victoryDetail);
      // Load victories (regardless of whether already loaded)
      if (this.victoryService.victories.length > 0) {
        this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
      } else {
        this.victoryListSubscription = this.victoryService.victoryChangedEvent.subscribe(() => {
          this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
        });

        this.victoryService.getVictories();
      }
    });
  }

  linkEditWithDay() {
    this.victoryService.notEmptyEditDay = this.selectedDay;
    console.log("detail service notEmptyEdit: ", this.selectedDay); 
    this.victoryService.closeEditDay = false;     
  }

  getEditRoute(): any[] {
    if (this.victoriesForDay && this.victoriesForDay.length > 0) {  
      // edit the first victory for the day
      return ['/victories', this.victoriesForDay[0].day, this.victoriesForDay[0].id, 'edit'];
    }
    // no victories: open the "new victory for day" edit route
    return ['/victories/day', this.selectedDay || 'new', 'edit'];
  }

  private loadDetailData() {
    this.victory = this.victoryService.getVictory(this.id);
    if (this.victory) {
      this.selectedDay = this.victory.day;  
      this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
    }
  }

  toggleSelection(v: Victory) {
    if (!v || !v.id) return;
    const idx = this.selectedVictoryIds.indexOf(v.id);
    if (idx === -1) {
      this.selectedVictoryIds.push(v.id);
    } else {
      this.selectedVictoryIds.splice(idx, 1);
    }
  }

  selectAll() {
    this.selectedVictoryIds = this.victoriesForDay.map(v => v.id);
  }

  deselectAll() {
    this.selectedVictoryIds = [];
  }

  // onDelete: delete selected ids, then wait for service event to refresh and maybe navigate
  onDelete() {
    if (!this.selectedVictoryIds || this.selectedVictoryIds.length === 0) {
      alert("Select at least one victory to delete.");
      return;
    }
    if (!confirm("Are you sure you want to delete the selected victories?")) {
      return;
    }
    // make a copy of ids to delete
    const idsToDelete = [...this.selectedVictoryIds];
    // call delete for each id (find the Victory object and call service)
    idsToDelete.forEach(id => {
      const v = this.victoryService.victories.find(x => x.id === id);
      if (v) {
        this.victoryService.deleteVictory(v);
      } else {
        // if not in memory, you could call a new deleteById; fallback: ignore
        console.warn('Victory to delete not found in memory:', id);
      }
    });
    // Clear local selection immediately to reflect UI intent
    this.selectedVictoryIds = [];
    // Now wait for the next victoryChangedEvent from the service to refresh local list.
    const sub = this.victoryService.victoryChangedEvent.subscribe(() => {
      // refresh the list for this day from the service
      this.victoriesForDay = this.victoryService.getVictoriesByDay(this.selectedDay);
      // if no victories left for the day, navigate back to the list
      if (!this.victoriesForDay || this.victoriesForDay.length === 0) {
        sub.unsubscribe();
        this.router.navigate(['/victories']);
        return;
      }
      // still have victories: update selection state (cleared already)
      sub.unsubscribe();
    });
  }

  onClose() {    
  this.router.navigate(['/victories']); 
  this.victoryService.closeEditDay = true;
  } 

  ngOnDestroy(): void {  // Add this method
    this.paramsSubscription?.unsubscribe();  // Clean up outer
    this.victoryListSubscription?.unsubscribe();  // Clean up inner (if created)
  }
}