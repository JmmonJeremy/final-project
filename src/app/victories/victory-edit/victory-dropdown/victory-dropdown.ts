import { Component, Input } from '@angular/core';

import { Victory } from '../../victory.model';

@Component({
  selector: 'cms-victory-dropdown',
  standalone: false,
  templateUrl: './victory-dropdown.html',
  styleUrl: './victory-dropdown.css'
})
export class VictoryDropdown {
  open = false;

  @Input() victories: Victory[] = [];
  @Input() placeholder = 'To Add ... ⇘Drag Over⇘';
}
