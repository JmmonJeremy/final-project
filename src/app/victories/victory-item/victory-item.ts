import { AfterContentChecked, Component, Input } from '@angular/core';

import { Victory } from '../victory.model';
import { DayOfWeek } from '../../shared/constants';
import { VictoryService } from '../victory.service';
import { ActivatedRoute } from '@angular/router';

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
  victoryDetail: string;
  lastUrlSegment: string;

  @Input() day: DayOfWeek;
  @Input() victories: Victory[];

  constructor(public victoryService: VictoryService, private route: ActivatedRoute) { }

  ngAfterContentChecked(): void {
    // this.victoryService.lastUrlSegment = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
// this.lastUrlSegment = this.victoryService.lastUrlSegment;
    this.dayNavigation = this.victoryService.dayNavigation;
    this.editDayNavMode = this.victoryService.editDayNavMode;
    // this.victoryDetail = this.victoryService.victoryDetail;
    // console.log("Item AfterContent lastUrlSegment: ", this.victoryService.lastUrlSegment); 
  }

  getRouteForDay(): any[] {
    this.victoryDetail = this.victoryService.victoryDetail;
    // console.log("Before victoryDetail: ",this.victoryService.victoryDetail); 
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
    //  console.log("addingModeOff Method victoryDetail: ",this.victoryDetail); 
    //  console.log("Service victoryDetail: ",this.victoryService.victoryDetail);
  // this.lastUrlSegment = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
        // this.lastUrlSegment = this.victoryService.lastUrlSegment;
        console.log("Item addingModeOff lastUrlSegment: ", this.victoryService.lastUrlSegment);     
  }
}