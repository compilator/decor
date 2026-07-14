import { Injectable, Injector, afterNextRender, inject, DestroyRef } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, Scroll } from '@angular/router';
import { Observable, filter, switchMap } from 'rxjs';

/**
 * Complements Router `scrollPositionRestoration` / `anchorScrolling`:
 * re-applies top / restore / anchor scroll after the next render so lazy
 * route views are in the DOM. Anchor navigations use smooth scrolling.
 */
@Injectable({ providedIn: 'root' })
export class AppScrollService {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        switchMap(event => this.afterNextRender$(event)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => this.applyScroll(event));
  }

  private afterNextRender$<T>(value: T): Observable<T> {
    return new Observable(subscriber => {
      const ref = afterNextRender(
        () => {
          subscriber.next(value);
          subscriber.complete();
        },
        { injector: this.injector }
      );
      return () => ref.destroy();
    });
  }

  private applyScroll(event: Scroll): void {
    if (event.position) {
      this.withScrollBehavior('auto', () => {
        this.viewportScroller.scrollToPosition(event.position!);
      });
      return;
    }

    if (event.anchor) {
      this.withScrollBehavior('smooth', () => {
        this.viewportScroller.scrollToAnchor(event.anchor!);
      });
      return;
    }

    this.withScrollBehavior('auto', () => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  private withScrollBehavior(behavior: ScrollBehavior, action: () => void): void {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effective: ScrollBehavior = reduceMotion ? 'auto' : behavior;

    root.style.scrollBehavior = effective;
    action();

    if (effective !== 'smooth') {
      root.style.scrollBehavior = previous;
      return;
    }

    const restore = (): void => {
      root.style.scrollBehavior = previous;
      window.removeEventListener('scrollend', restore);
    };
    window.addEventListener('scrollend', restore, { once: true });
  }
}
