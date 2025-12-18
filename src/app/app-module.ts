import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DndModule } from 'ngx-drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { App } from './app';
import { Header } from './header';
import { Contacts } from './contacts/contacts';
import { ContactList } from './contacts/contact-list/contact-list';
import { ContactDetail } from './contacts/contact-detail/contact-detail';
import { ContactItem } from './contacts/contact-item/contact-item';
import { Documents } from './documents/documents';
import { DocumentList } from './documents/document-list/document-list';
import { DocumentItem } from './documents/document-list/document-item/document-item';
import { DocumentDetail } from './documents/document-detail/document-detail';
import { MessageItem } from './messages/message-item/message-item';
import { MessageEdit } from './messages/message-edit/message-edit';
import { MessageList } from './messages/message-list/message-list';
import { DropdownDirective } from './shared/dropdown.directive';
import { AppRoutingModule } from './app-routing.module';
import { DocumentEdit } from './documents/document-edit/document-edit';
import { ContactEdit } from './contacts/contact-edit/contact-edit';
import { ContactsFilterPipe } from './contacts/contacts-filter-pipe';
import { Victories } from './victories/victories';
import { VictoryDetail } from './victories/victory-detail/victory-detail';
import { VictoryEdit } from './victories/victory-edit/victory-edit';
import { VictoryItem } from './victories/victory-item/victory-item';
import { VictoryList } from './victories/victory-list/victory-list';
import { VictoriesFilterPipe } from './victories/victories-filter-pipe';
import { VictoryDropdown } from './victories/victory-edit/victory-dropdown/victory-dropdown';

@NgModule({
  declarations: [
    App,
    Header,
    Contacts,
    ContactList,
    ContactDetail,
    ContactItem,
    Documents,
    DocumentList,
    DocumentItem,
    DocumentDetail,
    MessageItem,
    MessageEdit,
    MessageList,
    DropdownDirective,
    DocumentEdit,
    ContactEdit,
    ContactsFilterPipe,
    Victories,
    VictoryDetail,
    VictoryEdit,
    VictoryItem,
    VictoryList,
    VictoriesFilterPipe,
    VictoryDropdown   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DndModule,
    BrowserAnimationsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
