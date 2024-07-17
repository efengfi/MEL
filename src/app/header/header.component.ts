import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() sidebarActive = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor() {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
