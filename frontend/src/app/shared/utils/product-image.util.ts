import { environment } from '../../../environments/environment';

export function getProductImageUrl(image: string): string {
  if (!image) {
    return '';
  }
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('assets/') || image.startsWith('/')) {
    return image;
  }
  return `${environment.staticHost}/images/products/${image}`;
}
