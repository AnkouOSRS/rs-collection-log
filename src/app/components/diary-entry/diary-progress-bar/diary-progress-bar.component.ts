import {Component, Input, OnInit} from '@angular/core';
import {DiaryRegion} from "../../../models/diary-region";

@Component({
  selector: 'app-diary-progress-bar',
  templateUrl: './diary-progress-bar.component.html',
  styleUrls: ['./diary-progress-bar.component.scss']
})
export class DiaryProgressBarComponent implements OnInit {
  @Input() progress = 0;
  @Input() region: DiaryRegion;

  constructor() { }

  ngOnInit() {
  }

  setProgress(progress) {
    this.region.progress = (this.progress === progress ? progress - 1 : progress);
  }
}
