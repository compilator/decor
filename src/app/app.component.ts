import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, switchMap, distinctUntilChanged, skip } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { AppScrollService } from './shared/services/app-scroll.service';
import { CartService } from './shared/services/cart.service';
import { FavoriteService } from './shared/services/favorite.service';
import { OrderService } from './shared/services/order.service';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private userService: UserService,
    private orderService: OrderService,
    private authService: AuthService,
    _appScroll: AppScrollService
  ) {
  }

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({ error: () => undefined });

    if (this.authService.isLogged()) {
      this.favoriteService.loadFavorites().subscribe({ error: () => undefined });
      this.userService.loadUser().subscribe({ error: () => undefined });
    }

    this.authService.isLogged$.pipe(
      distinctUntilChanged(),
      skip(1),
      switchMap(isLogged => {
        if (isLogged) {
          return forkJoin([
            this.cartService.loadCart().pipe(catchError(() => of(null))),
            this.favoriteService.loadFavorites(true).pipe(catchError(() => of([]))),
            this.userService.loadUser().pipe(catchError(() => of(null)))
          ]);
        }

        this.favoriteService.clearLocalState();
        this.userService.clearLocalState();
        this.orderService.clearLocalState();
        return this.cartService.loadCart().pipe(catchError(() => of(null)));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
