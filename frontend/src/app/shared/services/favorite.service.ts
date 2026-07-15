import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  finalize,
  map,
  of,
  shareReplay,
  tap,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { FavoriteType } from '../../../types/favorite.type';
import { DefaultResponseType } from '../../../types/default-response.type';
import { ProductType } from '../../../types/product.type';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoritesSubject = new BehaviorSubject<ProductType[]>([]);
  private favoriteIdsSubject = new BehaviorSubject<ReadonlySet<string>>(new Set());
  private updatingIds = new Set<string>();
  private updatingSubject = new BehaviorSubject<ReadonlySet<string>>(new Set());
  private hasLoaded = false;
  private loadInFlight$: Observable<ProductType[]> | null = null;

  favorites$ = this.favoritesSubject.asObservable();
  favoriteIds$ = this.favoriteIdsSubject.asObservable();
  updatingIds$ = this.updatingSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  getFavorites(): Observable<FavoriteType[] | DefaultResponseType> {
    return this.http.get<FavoriteType[] | DefaultResponseType>(environment.api + '/favorites');
  }

  addFavorite(productId: string): Observable<FavoriteType | DefaultResponseType> {
    return this.http.post<FavoriteType | DefaultResponseType>(environment.api + '/favorites', {
      productId
    });
  }

  removeFavorite(productId: string): Observable<DefaultResponseType> {
    return this.http.delete<DefaultResponseType>(environment.api + '/favorites', {
      body: { productId }
    });
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIdsSubject.value.has(productId);
  }

  isUpdating(productId: string): boolean {
    return this.updatingIds.has(productId);
  }

  hasLoadedFavorites(): boolean {
    return this.hasLoaded;
  }

  loadFavorites(force = false): Observable<ProductType[]> {
    if (this.hasLoaded && !force) {
      return of(this.favoritesSubject.value);
    }

    if (this.loadInFlight$ && !force) {
      return this.loadInFlight$;
    }

    this.loadInFlight$ = this.getFavorites().pipe(
      map(response => {
        if (!this.isFavoriteArray(response)) {
          throw new Error((response as DefaultResponseType).message || 'Не удалось загрузить избранное');
        }
        return response.map(item => this.toProduct(item));
      }),
      tap(products => {
        this.hasLoaded = true;
        this.applyFavorites(products);
      }),
      finalize(() => {
        this.loadInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.loadInFlight$;
  }

  toggleFavorite(productId: string): Observable<ProductType[]> {
    if (this.updatingIds.has(productId)) {
      return throwError(() => new Error('Обновление уже выполняется'));
    }

    return this.isFavorite(productId)
      ? this.remove(productId)
      : this.add(productId);
  }

  add(productId: string): Observable<ProductType[]> {
    if (this.updatingIds.has(productId)) {
      return throwError(() => new Error('Обновление уже выполняется'));
    }

    this.setUpdating(productId, true);

    return this.addFavorite(productId).pipe(
      map(response => {
        if (!this.isFavoriteItem(response)) {
          throw new Error((response as DefaultResponseType).message || 'Не удалось добавить в избранное');
        }
        const product = this.toProduct(response);
        const next = [...this.favoritesSubject.value];
        if (!next.some(item => item.id === product.id)) {
          next.push(product);
        }
        this.applyFavorites(next);
        return next;
      }),
      finalize(() => this.setUpdating(productId, false))
    );
  }

  remove(productId: string): Observable<ProductType[]> {
    if (this.updatingIds.has(productId)) {
      return throwError(() => new Error('Обновление уже выполняется'));
    }

    this.setUpdating(productId, true);

    return this.removeFavorite(productId).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.message || 'Не удалось удалить из избранного');
        }
        const next = this.favoritesSubject.value.filter(item => item.id !== productId);
        this.applyFavorites(next);
        return next;
      }),
      finalize(() => this.setUpdating(productId, false))
    );
  }

  clearLocalState(): void {
    this.hasLoaded = false;
    this.loadInFlight$ = null;
    this.applyFavorites([]);
    this.updatingIds.clear();
    this.updatingSubject.next(new Set());
  }

  private applyFavorites(products: ProductType[]): void {
    this.favoritesSubject.next(products);
    this.favoriteIdsSubject.next(new Set(products.map(product => product.id)));
  }

  private toProduct(favorite: FavoriteType): ProductType {
    return {
      id: favorite.id,
      name: favorite.name,
      price: favorite.price,
      image: favorite.image,
      url: favorite.url,
      lightning: '',
      humidity: '',
      temperature: '',
      height: 0,
      diameter: 0
    };
  }

  private isFavoriteArray(data: FavoriteType[] | DefaultResponseType): data is FavoriteType[] {
    return Array.isArray(data);
  }

  private isFavoriteItem(data: FavoriteType | DefaultResponseType): data is FavoriteType {
    return !!(data as FavoriteType).id
      && !!(data as FavoriteType).name
      && !!(data as FavoriteType).url
      && typeof (data as FavoriteType).price === 'number';
  }

  private setUpdating(productId: string, value: boolean): void {
    if (value) {
      this.updatingIds.add(productId);
    } else {
      this.updatingIds.delete(productId);
    }
    this.updatingSubject.next(new Set(this.updatingIds));
  }
}
