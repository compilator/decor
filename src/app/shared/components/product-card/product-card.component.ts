import { Component, DestroyRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { ProductType } from '../../../../types/product.type';
import { getProductImageUrl } from '../../utils/product-image.util';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  standalone: false
})
export class ProductCardComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  @Input() product!: ProductType;
  @Input() variant: 'grid' | 'favorite' = 'grid';
  @Input() cardClass = 'offers__card';

  isLogged = false;
  isFavorite = false;
  isFavoriteUpdating = false;

  constructor(
    private authService: AuthService,
    private favoriteService: FavoriteService
  ) {
    this.isLogged = this.authService.isLogged();

    this.authService.isLogged$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(isLogged => {
      this.isLogged = isLogged;
      if (!isLogged) {
        this.isFavorite = false;
        this.isFavoriteUpdating = false;
      }
    });

    this.favoriteService.favoriteIds$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.syncFavorite();
    });

    this.favoriteService.updatingIds$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.syncUpdating();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.syncFavorite();
      this.syncUpdating();
    }
  }

  get imageUrl(): string {
    return getProductImageUrl(this.product?.image || '');
  }

  onFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isLogged || !this.product?.id || this.isFavoriteUpdating) {
      return;
    }

    this.favoriteService.toggleFavorite(this.product.id).subscribe({
      error: () => undefined
    });
  }

  onRemoveFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.product?.id || this.isFavoriteUpdating) {
      return;
    }

    this.favoriteService.remove(this.product.id).subscribe({
      error: () => undefined
    });
  }

  private syncFavorite(): void {
    this.isFavorite = this.product?.id
      ? this.favoriteService.isFavorite(this.product.id)
      : false;
  }

  private syncUpdating(): void {
    this.isFavoriteUpdating = this.product?.id
      ? this.favoriteService.isUpdating(this.product.id)
      : false;
  }
}
