// side-bar.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  minimized = true;
  activeLink: any = null;

  constructor() {}

  toggleMinimized() {
    this.minimized = !this.minimized;
  }

  setActive(event: Event) {
    // Remove active class from the previous active link
    if (this.activeLink) {
      this.activeLink.classList.remove('active');
    }

    // Set the clicked link as active
    this.activeLink = event.currentTarget;
    this.activeLink.classList.add('active');
  }
}
