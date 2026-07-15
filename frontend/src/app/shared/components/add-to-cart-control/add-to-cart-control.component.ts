import { Component, DestroyRef, HostBinding, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-add-to-cart-control',
  templateUrl: './add-to-cart-control.component.html',
  styleUrl: './add-to-cart-control.component.scss',
  standalone: false
})
export class AddToCartControlComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) productId!: string;
  @Input() buttonClass = 'button button--primary';
  @Input() layout: 'card' | 'detail' | 'favorite' = 'card';

  count = 0;
  updating = false;
  errorMessage = '';

  @HostBinding('class.add-to-cart-host--detail')
  get isDetailHost(): boolean {
    return this.layout === 'detail';
  }

  @HostBinding('class.add-to-cart-host--favorite')
  get isFavoriteHost(): boolean {
    return this.layout === 'favorite';
  }

  @HostBinding('style.display')
  get hostDisplay(): string | null {
    return this.layout === 'detail' ? 'contents' : null;
  }

  constructor(private cartService: CartService) {
    this.cartService.cart$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.syncCount();
    });

    this.cartService.updatingIds$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.updating = this.productId ? this.cartService.isUpdating(this.productId) : false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId']) {
      this.syncCount();
      this.updating = this.productId ? this.cartService.isUpdating(this.productId) : false;
    }
  }

  add(): void {
    this.setQuantity(1);
  }

  onCountChange(quantity: number): void {
    this.setQuantity(quantity);
  }

  private setQuantity(quantity: number): void {
    if (!this.productId || this.updating) {
      return;
    }

    const previous = this.count;
    this.errorMessage = '';
    this.count = quantity;

    this.cartService.setProductQuantity(this.productId, quantity).subscribe({
      next: () => {
        this.syncCount();
      },
      error: () => {
        this.count = previous;
        this.errorMessage = 'Не удалось обновить корзину';
      }
    });
  }

  private syncCount(): void {
    if (!this.productId) {
      this.count = 0;
      return;
    }
    this.count = this.cartService.getProductQuantity(this.productId);
  }
}
