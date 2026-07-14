import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  standalone: false
})
export class LoaderComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  @Input() minDurationMs = 1000;

  visible = false;

  private shownAt = 0;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private showBound = false;

  @Input()
  set show(value: boolean) {
    this.showBound = true;
    this.applyShow(!!value);
  }

  ngOnInit(): void {
    // Compact/search: visible while mounted. Page loaders use [show].
    if (this.compact || !this.showBound) {
      this.applyShow(true);
    }
  }

  ngOnDestroy(): void {
    this.clearHideTimer();
  }

  private applyShow(value: boolean): void {
    if (value) {
      this.clearHideTimer();
      this.visible = true;
      this.shownAt = Date.now();
      return;
    }

    if (!this.visible) {
      return;
    }

    if (this.compact) {
      this.visible = false;
      return;
    }

    const elapsed = Date.now() - this.shownAt;
    const remain = Math.max(0, this.minDurationMs - elapsed);

    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      this.visible = false;
      this.hideTimer = null;
    }, remain);
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
