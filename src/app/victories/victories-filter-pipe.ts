import { Pipe, PipeTransform } from '@angular/core';

import { Victory } from './victory.model';

@Pipe({
  name: 'victoriesFilter',
  standalone: false
})
export class VictoriesFilterPipe implements PipeTransform {

  transform(victories: Victory[], term: string): any {
    let filteredVictories: Victory[] =[];  
    if (term && term.length > 0) {
      filteredVictories = victories.filter(
        (victory:Victory) => victory.victory.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (filteredVictories.length < 1){
      return victories;
    }
    return filteredVictories;
  }
}