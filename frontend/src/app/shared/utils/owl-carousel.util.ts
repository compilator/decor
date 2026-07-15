import { OwlOptions } from 'ngx-owl-carousel-o';

const NAV_ICONS: [string, string] = [
  '<img src="assets/images/icon-arrow-left.svg" width="16" height="16" alt="">',
  '<img src="assets/images/icon-arrow-right.svg" width="16" height="16" alt="">'
];

/** Product carousels: desktop shows up to 4 items. */
export function buildProductCarouselOptions(slideCount: number): OwlOptions {
  const canNavigate = slideCount > 4;

  return {
    loop: canNavigate,
    nav: canNavigate,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 26,
    autoHeight: false,
    navText: NAV_ICONS,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 },
      1200: { items: 4 }
    }
  };
}

/** Reviews carousel: desktop shows up to 3 items. */
export function buildReviewsCarouselOptions(slideCount: number): OwlOptions {
  const canNavigate = slideCount > 3;

  return {
    loop: canNavigate,
    nav: canNavigate,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 26,
    autoHeight: false,
    navText: NAV_ICONS,
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
