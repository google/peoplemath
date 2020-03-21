import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pill',
  template: '<span class="pill pill-primary"><ng-content></ng-content></span>',
  styleUrls: ['./pill.component.css'],
})
export class PillComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
