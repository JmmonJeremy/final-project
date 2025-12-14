export class Message {
  constructor (
    public id: string, 
    public subject: string, 
    public msgText: string, 
    public sender: string
   ) {}
}
// Victory Planner Code
export class Victory {
  constructor(
    public id: string,
    public day: string,
    public number: number,
    public victory: string,
    public _id?: string
  ) {}
}