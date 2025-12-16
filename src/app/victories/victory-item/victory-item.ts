import { AfterContentChecked, Component, Input, } from '@angular/core';

import { Victory } from '../victory.model';
import { DayOfWeek } from '../../shared/constants';
import { VictoryService } from '../victory.service';

@Component({
  selector: 'cms-victory-item',
  standalone: false,
  templateUrl: './victory-item.html',
  styleUrl: './victory-item.css'
})
export class VictoryItem implements AfterContentChecked{
  notEmptyEditDay: string;
  closeEditDay: boolean;
  editDayNavMode: boolean;
  dayNavigation: string;

  @Input() day: DayOfWeek;
  @Input() victories: Victory[];

  constructor(private victoryService: VictoryService) {     
  }

  ngAfterContentChecked(): void {
    this.dayNavigation = this.victoryService.dayNavigation;
    this.editDayNavMode = this.victoryService.editDayNavMode;
  }

  getRouteForDay(): any[] {
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
  }
}