import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';
import { catchError, finalize, of } from 'rxjs';
import { CartService } from '../../../shared/services/cart.service';
import { ProductService } from '../../../shared/services/product.service';
import { buildRelatedCarouselOptions } from '../../../shared/utils/owl-carousel.util';
import { getProductImageUrl } from '../../../shared/utils/product-image.util';
import { CartType } from '../../../../types/cart.type';
import { ProductType } from '../../../../types/product.type';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: false
})
export class CartComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('relatedCarousel') relatedCarousel?: CarouselComponent;

  items: CartType['items'] = [];
  related: ProductType[] = [];
  relatedOptions: OwlOptions = buildRelatedCarouselOptions(0);
  loading = true;
  errorMessage = '';
  updatingIds = new Set<string>();

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    this.cartService.cart$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(cart => {
      this.items = cart?.items || [];
    });

    this.cartService.updatingIds$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(ids => {
      this.updatingIds = new Set(ids);
    });

    this.loading = true;
    this.errorMessage = '';
    this.cartService.loadCart().pipe(
      finalize(() => {
        this.loading = false;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loadRelated();
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить корзину';
      }
    });
  }

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  itemTotal(item: CartType['items'][number]): number {
    return item.product.price * item.quantity;
  }

  productImage(image: string): string {
    return getProductImageUrl(image);
  }

  isUpdating(productId: string): boolean {
    return this.updatingIds.has(productId);
  }

  onQuantityChange(productId: string, quantity: number): void {
    this.errorMessage = '';
    this.cartService.setProductQuantity(productId, quantity).subscribe({
      error: () => {
        this.errorMessage = 'Не удалось изменить количество';
        this.cartService.loadCart().subscribe();
      }
    });
  }

  removeItem(productId: string): void {
    this.onQuantityChange(productId, 0);
  }

  prevRelated(): void {
    this.relatedCarousel?.prev();
  }

  nextRelated(): void {
    this.relatedCarousel?.next();
  }

  private loadRelated(): void {
    this.productService.getBestProducts().pipe(
      catchError(() => of([] as ProductType[])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(products => {
      const cartUrls = new Set(this.items.map(item => item.product.url));
      this.related = products.filter(product => !cartUrls.has(product.url)).slice(0, 4);
      this.relatedOptions = buildRelatedCarouselOptions(this.related.length);
    });
  }
}
