import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Victory } from './victory.model';
import { DAYS_OF_WEEK } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class VictoryService {
  victoryChangedEvent = new Subject<Victory[]>();
  victorySelectedEvent = new EventEmitter<Victory>();
  victories: Victory[] = [];
  maxVictoryId: number; 
  inAddButton: boolean = false;
  notEmptyEditDay: string = "other"; 
  closeEditDay: boolean = false;
  editDayNavMode: boolean = false;
  dayNavigation: string = "other";

  constructor(private http: HttpClient) { }

  private sortThenSend() {
    this.victories.sort((a, b) => {
      const dayDiff = 
        DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return Number(a.number) - Number(b.number);
    });

    this.victoryChangedEvent.next(this.victories.slice());
  }

  getVictories(): void {
    this.http.get<{ message: string, victories: Victory[] }>(`${environment.apiUrl}/victories`).subscribe({
      // Success callback
      next: (response) => {        
        this.victories = response.victories;
        console.log("Raw victory from server:", response.victories[0]);
        for (const key of Object.keys(response.victories[0])) {
          console.log("KEY:", key, "TYPE:", typeof response.victories[0][key]);
        }

        console.log('Victories loaded:', this.victories);
        this.maxVictoryId = this.getMaxVId();
        this.sortThenSend();
      },
      // Error callback
      error: (error: any) => {
        console.error('Error loading victories:', error);
      }
    });     
  }

  getVictory(id: string): Victory {     
    for (let victory of this.victories) {
      if (victory.id === id) {
        return victory;
      }
    }
    return null;
  }
    
  getMaxVId(): number {
    let maxId = 0;
    for (const victory of this.victories) {
      const currentId = parseInt(victory.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

  getVictoriesByDay(day: string): Victory[] {
    if (!this.victories || this.victories.length === 0) return [];
    return this.victories.filter(v => v.day === day);
  }

  addVictory(victory: Victory) {
    if (!victory) {
      return;
    }
    // make sure id of the new Victory is empty
    victory.id = '';
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // add to database
    this.http.post<{ message: string, victory: Victory }>(`${environment.apiUrl}/victories`,
      victory,
      { headers: headers })
      .subscribe(
        (responseData) => {
          // add new victory to victories
          this.victories.push(responseData.victory);
          this.sortThenSend();
        }
      );
  }

  updateVictory(originalVictory: Victory, newVictory: Victory) {
    if (!originalVictory || !newVictory) {
      return;
    }
    const pos = this.victories.indexOf(originalVictory);
    if (pos < 0) {
      return;
    }
    // set the id of the new Victory to the id of the old Victory
    newVictory.id = originalVictory.id;
    newVictory._id = originalVictory._id;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // update database
    this.http.put(`${environment.apiUrl}/victories/` + originalVictory.id,
      newVictory, { headers: headers })
      .subscribe(
        (response: Response) => {
          this.victories[pos] = newVictory;
          this.sortThenSend();
        }
      );
  }

  deleteVictory(victory: Victory) {
    if (!victory) {
        return;
    }
    const pos = this.victories.findIndex(d => d.id === victory.id);
    if (pos < 0) {
        return;
    }
    // delete from database
    this.http.delete(`${environment.apiUrl}/victories/` + victory.id)
      .subscribe(
        (response: Response) => {
          this.victories.splice(pos, 1);
          this.sortThenSend();
        }
      );
  }
}