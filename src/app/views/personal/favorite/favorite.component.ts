import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { ProductType } from '../../../../types/product.type';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss',
  standalone: false
})
export class FavoriteComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  favorites: ProductType[] = [];
  loading = false;
  errorMessage = '';

  constructor(private favoriteService: FavoriteService) {
  }

  ngOnInit(): void {
    this.favoriteService.favorites$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(favorites => {
      this.favorites = favorites;
    });

    if (this.favoriteService.hasLoadedFavorites()) {
      this.loading = false;
      return;
    }

    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.errorMessage = '';

    this.favoriteService.loadFavorites(true).pipe(
      catchError(() => {
        this.errorMessage = 'Не удалось загрузить избранное. Попробуйте ещё раз.';
        return of([] as ProductType[]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }
}
