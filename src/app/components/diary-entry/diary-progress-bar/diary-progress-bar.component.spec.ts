import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaryProgressBarComponent } from './diary-progress-bar.component';

describe('DiaryProgressBarComponent', () => {
  let component: DiaryProgressBarComponent;
  let fixture: ComponentFixture<DiaryProgressBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiaryProgressBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiaryProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
