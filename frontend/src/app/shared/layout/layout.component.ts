import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: false
})
export class LayoutComponent implements OnDestroy {
  showChrome = true;
  private sub: Subscription;

  constructor(private router: Router) {
    this.updateChrome(this.router.url);
    this.sub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.updateChrome(event.urlAfterRedirects));
  }

  private updateChrome(url: string): void {
    this.showChrome = !url.startsWith('/order-success');
    document.body.classList.toggle('page-thank-you', !this.showChrome);
    document.body.classList.toggle('is-scroll-locked', !this.showChrome);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    document.body.classList.remove('page-thank-you', 'is-scroll-locked');
  }
}
