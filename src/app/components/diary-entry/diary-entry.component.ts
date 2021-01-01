import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DiaryRegion} from "../../models/diary-region";

@Component({
  selector: 'app-diary-spinner',
  templateUrl: './diary-entry.component.html',
  styleUrls: ['./diary-entry.component.scss']
})
export class DiaryEntryComponent implements OnInit {
  @Output() regionChanged: EventEmitter<any> = new EventEmitter();
  @Input() regions: DiaryRegion[];
  colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#C5D86D', '#F7F7F2', '#E4E6C3', '#F05D23',
    '#009DDC', '#F26430', '#009B72'];

  constructor() {

  }

  ngOnInit() {

  }
}
