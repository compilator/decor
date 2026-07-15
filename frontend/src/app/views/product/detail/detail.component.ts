import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { ProductService } from '../../../shared/services/product.service';
import { buildRelatedCarouselOptions } from '../../../shared/utils/owl-carousel.util';
import { getProductImageUrl } from '../../../shared/utils/product-image.util';
import { ProductType } from '../../../../types/product.type';

type ProductSpec = {
  icon: string;
  title: string;
  text: string;
};

@Component({
  selector: 'app-product-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('relatedCarousel') relatedCarousel?: CarouselComponent;

  product: ProductType | null = null;
  related: ProductType[] = [];
  specs: ProductSpec[] = [];
  imageUrl = '';
  loading = true;
  error = false;
  isLogged = false;
  isFavorite = false;
  isFavoriteUpdating = false;
  relatedOptions: OwlOptions = buildRelatedCarouselOptions(0);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private favoriteService: FavoriteService
  ) {
    this.isLogged = this.authService.isLogged();
  }

  ngOnInit(): void {
    this.authService.isLogged$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(isLogged => {
      this.isLogged = isLogged;
      if (!isLogged) {
        this.isFavorite = false;
        this.isFavoriteUpdating = false;
      }
      this.syncFavoriteState();
    });

    this.favoriteService.favoriteIds$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.syncFavoriteState());

    this.favoriteService.updatingIds$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.syncFavoriteState());

    this.route.paramMap.pipe(
      map(params => params.get('url') || ''),
      switchMap(url => {
        this.loading = true;
        this.error = false;
        this.product = null;
        this.related = [];
        this.specs = [];
        this.isFavorite = false;
        this.isFavoriteUpdating = false;
        this.relatedOptions = buildRelatedCarouselOptions(0);

        if (!url) {
          this.error = true;
          this.loading = false;
          return of(null);
        }

        return this.productService.getProduct(url).pipe(
          catchError(() => {
            this.error = true;
            return of(null);
          }),
          switchMap(product => {
            this.product = product;
            this.syncFavoriteState();
            if (!product) {
              return of([] as ProductType[]);
            }

            this.imageUrl = getProductImageUrl(product.image);
            this.specs = this.buildSpecs(product);

            return this.productService.getProducts({ types: [], page: 1 }).pipe(
              map(response =>
                response.items.filter(item => item.url !== product.url).slice(0, 8)
              ),
              catchError(() => of([] as ProductType[]))
            );
          }),
          finalize(() => {
            this.loading = false;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(related => {
      this.related = related || [];
      this.relatedOptions = buildRelatedCarouselOptions(this.related.length);
    });
  }

  toggleFavorite(): void {
    if (!this.product?.id || this.isFavoriteUpdating || !this.isLogged) {
      return;
    }

    this.favoriteService.toggleFavorite(this.product.id).subscribe({
      error: () => undefined
    });
  }

  prevRelated(): void {
    this.relatedCarousel?.prev();
  }

  nextRelated(): void {
    this.relatedCarousel?.next();
  }

  private syncFavoriteState(): void {
    const productId = this.product?.id;
    this.isFavorite = productId ? this.favoriteService.isFavorite(productId) : false;
    this.isFavoriteUpdating = productId ? this.favoriteService.isUpdating(productId) : false;
  }

  private buildSpecs(product: ProductType): ProductSpec[] {
    const specs: ProductSpec[] = [];

    if (product.lightning) {
      specs.push({
        icon: 'assets/images/icon-01.png',
        title: 'Освещение',
        text: product.lightning
      });
    }
    if (product.humidity) {
      specs.push({
        icon: 'assets/images/icon-02.png',
        title: 'Влажность',
        text: product.humidity
      });
    }
    if (product.temperature) {
      specs.push({
        icon: 'assets/images/icon-03.png',
        title: 'Температура',
        text: product.temperature
      });
    }

    return specs;
  }
}
