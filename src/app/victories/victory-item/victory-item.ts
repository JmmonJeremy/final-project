import { Component, Input } from '@angular/core';

import { Victory } from '../victory.model';
import { DayOfWeek } from '../../shared/constants';

@Component({
  selector: 'cms-victory-item',
  standalone: false,
  templateUrl: './victory-item.html',
  styleUrl: './victory-item.css'
})
export class VictoryItem {
  @Input() day: DayOfWeek;
  @Input() victories: Victory[];

  getRouteForDay(): any[] {
    // If there are victories for this day → go to detail page
    if (this.victories && this.victories.length > 0) {
      return ['/victories/day', this.victories[0].day];
    }
    // If the day is empty → go to edit page
    return ['/victories/day', this.day || 'new', 'edit'];
  }
}