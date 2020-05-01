import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {
  MatButtonModule,
  MatGridListModule, MatInputModule, MatProgressBarModule, MatRadioModule,
  MatSelectModule,
  MatSlideToggleModule, MatSnackBarModule,
  MatTabsModule
} from "@angular/material";
import {ColorPickerModule} from "ngx-color-picker";
import {FONT_PICKER_CONFIG, FontPickerModule} from "ngx-font-picker";
import 'hammerjs';
import {ClipboardModule} from "ngx-clipboard";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DEFAULT_FONT_PICKER_CONFIG} from "./config";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatGridListModule,
    ColorPickerModule,
    FontPickerModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressBarModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule,
    ClipboardModule,
    MatSnackBarModule,
    NgbModule,
  ],
  providers: [
    {
      provide: FONT_PICKER_CONFIG,
      useValue: DEFAULT_FONT_PICKER_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
