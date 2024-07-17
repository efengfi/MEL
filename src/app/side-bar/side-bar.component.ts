import { Component } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  minimized = true;

  constructor() {}

  toggleMinimized() {
    this.minimized = !this.minimized;
  }
}
