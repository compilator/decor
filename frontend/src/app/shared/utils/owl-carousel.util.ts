import { OwlOptions } from 'ngx-owl-carousel-o';

/** Shared product/related carousel options. Built-in owl nav stays off — use custom buttons. */
export function buildProductCarouselOptions(slideCount: number): OwlOptions {
  const hasSlides = slideCount > 0;

  return {
    loop: hasSlides,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 26,
    autoHeight: false,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 },
      1200: { items: 4 }
    }
  };
}

/** Related products: same as product carousel with forced loop. */
export function buildRelatedCarouselOptions(slideCount: number): OwlOptions {
  return buildProductCarouselOptions(slideCount);
}

/** Reviews carousel: infinite loop; custom side/title buttons control it. */
export function buildReviewsCarouselOptions(slideCount: number): OwlOptions {
  const hasSlides = slideCount > 0;

  return {
    loop: hasSlides,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 26,
    autoHeight: false,
    responsive: {
      0: {
        items: 1,
        margin: 16
      },
      768: {
        items: 2,
        margin: 20
      },
      1024: {
        items: 3,
        margin: 26
      }
    }
  };
}
