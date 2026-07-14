import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-count-selector',
  templateUrl: './count-selector.component.html',
  styleUrl: './count-selector.component.scss',
  standalone: false
})
export class CountSelectorComponent {
  @Input() count = 1;
  @Input() disabled = false;
  @Input() min = 0;
  @Output() countChange = new EventEmitter<number>();

  decrease(): void {
    if (this.disabled || this.count <= this.min) {
      return;
    }
    this.countChange.emit(this.count - 1);
  }

  increase(): void {
    if (this.disabled) {
      return;
    }
    this.countChange.emit(this.count + 1);
  }
}
