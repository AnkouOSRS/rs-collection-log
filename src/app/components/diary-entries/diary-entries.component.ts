import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {DiaryRegion} from "../../models/diary-region";

@Component({
  selector: 'app-diary-spinner',
  templateUrl: './diary-entries.component.html',
  styleUrls: ['./diary-entries.component.scss']
})
export class DiaryEntriesComponent implements OnInit {
  @Output() regionChanged: EventEmitter<any> = new EventEmitter();
  @Input() regions: DiaryRegion[];
  colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#C5D86D', '#F7F7F2', '#E4E6C3', '#F05D23',
    '#009DDC', '#F26430', '#009B72'];

  constructor() {

  }

  ngOnInit() {

  }

  getDiaryInputWidth(name) {
    if (!name)
      return {width: '1ch'};
    return {width: (name.length) + "ch"};
  }
}
