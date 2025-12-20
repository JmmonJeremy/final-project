import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { MessageList } from "./messages/message-list/message-list";
import { Documents } from "./documents/documents";
import { DocumentEdit } from "./documents/document-edit/document-edit";
import { DocumentDetail } from "./documents/document-detail/document-detail";
import { Contacts } from "./contacts/contacts";
import { ContactEdit } from "./contacts/contact-edit/contact-edit";
import { ContactDetail } from "./contacts/contact-detail/contact-detail";
import { Victories } from "./victories/victories";
import { VictoryEdit } from "./victories/victory-edit/victory-edit";
import { VictoryDetail } from "./victories/victory-detail/victory-detail";


const appRoutes: Routes = [
  { path: '', redirectTo: '/documents', pathMatch: 'full' },
  { path: 'documents', component: Documents, children: [  
    { path: 'new', component: DocumentEdit },
    { path: ':id', component: DocumentDetail },
    { path: ':id/edit', component: DocumentEdit },
  ] },
  { path: 'messages', component: MessageList },
  { path: 'contacts', component: Contacts, children: [  
    { path: 'new', component: ContactEdit },
    { path: ':id', component: ContactDetail },
    { path: ':id/edit', component: ContactEdit },
  ] },
  { path: 'victories', component: Victories, children: [  
    { path: 'new', component: VictoryEdit },
    // NEW: route for day-based detail list
    { path: 'day/:day', component: VictoryDetail },
    { path: 'day/:day/edit', component: VictoryEdit },
    { path: ':day/:id/edit', component: VictoryEdit },
    // ORIGINAL routes
    { path: ':id', component: VictoryDetail },
    { path: ':id/edit', component: VictoryEdit },

  ] },
] 

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}