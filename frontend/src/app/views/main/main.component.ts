import { Component, DestroyRef, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { catchError, finalize, of } from 'rxjs';
import { ProductService } from '../../shared/services/product.service';
import {
  buildProductCarouselOptions,
  buildReviewsCarouselOptions
} from '../../shared/utils/owl-carousel.util';
import { ProductType } from '../../../types/product.type';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  standalone: false
})
export class MainComponent {
  private readonly destroyRef = inject(DestroyRef);

  offers: ProductType[] = [];
  offersLoading = true;
  offersError = false;
  offersOptions: OwlOptions = buildProductCarouselOptions(0);
  mapSrc: SafeResourceUrl;

  reviews = [
    {
      name: 'Аделина',
      avatar: 'assets/images/review-avatar-1.jpg',
      text: 'Хочу поблагодарить всю команду за помощь в подборе подарка для моей мамы! Все просто в восторге от мини-сада! А самое главное, что за ним удобно ухаживать, ведь в комплекте мне дали целую инструкцию.'
    },
    {
      name: 'Яника',
      avatar: 'assets/images/review-avatar-2.jpg',
      text: 'Спасибо большое за мою обновлённую коллекцию суккулентов! Сервис просто на 5+: быстро, удобно, недорого. Что ещё нужно клиенту для счастья?'
    },
    {
      name: 'Марина',
      avatar: 'assets/images/review-avatar-3.jpg',
      text: 'Для меня всегда важным аспектом было наличие не только физического магазина, но и онлайн-маркета, ведь не всегда есть возможность прийти на место. Ещё нигде не встречала такого огромного ассортимента!'
    }
  ];

  reviewsOptions: OwlOptions = buildReviewsCarouselOptions(this.reviews.length);

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private productService: ProductService
  ) {
    this.mapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://yandex.ru/map-widget/v1/?ll=27.631172%2C53.946122&mode=whatshere&whatshere%5Bpoint%5D=27.631172%2C53.946122&whatshere%5Bzoom%5D=17&z=17'
    );

    this.productService.getBestProducts().pipe(
      catchError(() => {
        this.offersError = true;
        return of([] as ProductType[]);
      }),
      finalize(() => {
        this.offersLoading = false;
        this.resyncFragmentAfterContentChange();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(products => {
      this.offers = products;
      this.offersOptions = buildProductCarouselOptions(products.length);
    });
  }

  /** Offers carousel load can shift anchors; re-apply fragment after layout settles. */
  private resyncFragmentAfterContentChange(): void {
    const fragment = this.route.snapshot.fragment;
    if (!fragment) {
      return;
    }

    this.viewportScroller.scrollToAnchor(fragment);
  }
}
