import { EventEmitter, Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
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
  emptyDays: boolean = false;
  victoryDetail: string = "boolean+day";
  clickedDay: string = "unset"  

  private stateChanged = new Subject<void>();
  stateChanged$ = this.stateChanged.asObservable();

  constructor(private http: HttpClient) { }

// NEW: Reset method for leaving edit
  resetVictoryDetail(): void {
    this.victoryDetail = '';
    this.stateChanged.next();  // Notify items to re-evaluate
  } 

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
        // console.log("Raw victory from server:", response.victories[0]);
        for (const key of Object.keys(response.victories[0])) {
          // console.log("KEY:", key, "TYPE:", typeof response.victories[0][key]);
        }

        // console.log('Victories loaded:', this.victories);
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

  getVictoriesList() {
    return this.victories.slice(); // full list copy
  }

  getVictoriesByDay(day: string): Victory[] {
    if (!this.victories || this.victories.length === 0) return [];
    return this.victories.filter(v => v.day === day);
  }

  private reorderVictoryList(targetDay: string): void {
    // Get only the victories for that day
    const daily = this.victories
      .filter(v => v.day === targetDay)      
      .sort((a, b) => a.number - b.number);
    // Move position to front if duplicate number is inserted 
    // Only do this for the day you are working on
    if (daily[0].day === targetDay) {      
      let index = 0;
        daily.forEach((victory1) => {        
          var duplicateCheck = victory1.number;        
          // move position to front if duplicate number is inserted
          daily.forEach((victory2) => {   
          if (daily.indexOf(victory2) > index && victory2.number === duplicateCheck) {            
            daily.splice(index, 0, victory1);
            daily.splice(index+2, 1);                    
          }
        });
        index ++
      });
    }
    // Renumber them by ones
    daily.forEach((v, i) => v.number = i + 1);
  }

  private persistReorderedVictories(day: string): void {
    const daily = this.victories.filter(v => v.day === day);

    daily.forEach(v => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.put(`${environment.apiUrl}/victories/${v.id}`, v, { headers })
        .subscribe({
          error: err => console.error('Failed reorder update for', v, err)
        });
    });
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
          // consolidate to single variable 
          const saved = responseData.victory;
          // add new victory to victories
          this.victories.push(saved);
          // reassign numbering within a day by passing in the day
          this.reorderVictoryList(saved.day);
          // save the change to the database
          this.persistReorderedVictories(saved.day);
          // now update sorting + emit
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
          // replace victory with new version
          this.victories[pos] = newVictory;
          // reassign numbering within a day by passing in the day
           this.reshuffleVictoryList(newVictory.day, newVictory);
          // // save the change to the database
          this.persistReorderedVictories(newVictory.day);
          // now update sorting + emit
          this.sortThenSend();
        }
      );
  }

  private reshuffleVictoryList(targetDay: string, editedVictory: Victory): void {
    // Get only the victories for that day & leave out altered victory
    const daily = this.victories    
      .filter(v => v.day === targetDay && v.id !== editedVictory.id)      
      .sort((a, b) => a.number - b.number);
    // Set index for inserting editedVictory
    const targetIndex = editedVictory.number - 1;  
    // Insert at desired position
    daily.splice(targetIndex, 0, editedVictory);
    // Renumber them by ones
    daily.forEach((v, i) => v.number = i + 1);   
  }

  // PART 2 OF 3 - Chat GPT's Fixed solution:
  deleteVictoriesByIds(ids: string[], day: string) {
    return this.http.delete<{ deletedCount: number }>(
      `${environment.apiUrl}/victories`,
      {
        body: { ids }
      }
    ).pipe(
      tap(() => {
        // Remove locally
        this.victories = this.victories.filter(v => !ids.includes(v.id));
        // Renumber list
        this.reorderVictoryList(day);
        this.persistReorderedVictories(day);
        // Emit changes to the Day list
        this.sortThenSend();
      })
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