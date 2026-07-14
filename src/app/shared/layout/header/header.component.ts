import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap
} from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { getProductImageUrl } from '../../utils/product-image.util';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { ProductType } from '../../../../types/product.type';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  @ViewChild('searchWrapper') searchWrapper?: ElementRef<HTMLElement>;

  menuOpen = false;
  isSearchOpen = false;
  searchValue = '';
  searchResults: ProductType[] = [];
  searchLoading = false;
  activeSearchIndex = 0;
  cartCount = 0;
  categories: CategoryWithTypeType[] = [];
  isLogged = false;
  isLogoutLoading = false;

  private readonly minSearchLength = 3;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.isLogged = this.authService.isLogged();
  }

  ngOnInit(): void {
    this.authService.isLogged$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(isLogged => {
      this.isLogged = isLogged;
    });

    this.cartService.cartCount$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(count => {
      this.cartCount = count;
    });

    this.categoryService.getCategoriesWithTypes().pipe(
      catchError(() => of([] as CategoryWithTypeType[])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(categories => {
      this.categories = categories;
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        const trimmed = query.trim();
        if (trimmed.length < this.minSearchLength) {
          this.searchResults = [];
          this.isSearchOpen = false;
          this.searchLoading = false;
          this.activeSearchIndex = 0;
          return of(null);
        }

        this.searchLoading = true;
        this.isSearchOpen = true;
        return this.productService.searchProducts(trimmed).pipe(
          catchError(() => of([] as ProductType[])),
          finalize(() => {
            this.searchLoading = false;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      if (results === null) {
        return;
      }
      this.searchResults = results;
      this.activeSearchIndex = results.length ? 0 : -1;
    });
  }

  getCategoryQueryParams(category: CategoryWithTypeType): { types: string[] } {
    return { types: category.types.map(type => type.url) };
  }

  productImage(product: ProductType): string {
    return getProductImageUrl(product.image);
  }

  logout(): void {
    if (this.isLogoutLoading) {
      return;
    }

    this.isLogoutLoading = true;
    this.authService.logout().pipe(
      finalize(() => {
        this.authService.removeTokens();
        this.authService.userId = null;
        this.isLogoutLoading = false;
        this.closeMenu();
        this.router.navigate(['/']);
      })
    ).subscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.updateBodyScrollLock();
  }

  closeMenu(): void {
    if (!this.menuOpen) {
      return;
    }
    this.menuOpen = false;
    this.updateBodyScrollLock();
  }

  onMenuPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchValue);
  }

  closeSearch(): void {
    this.isSearchOpen = false;
    this.activeSearchIndex = 0;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSearch();
      return;
    }

    if (!this.isSearchOpen || !this.searchResults.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSearchIndex = (this.activeSearchIndex + 1) % this.searchResults.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSearchIndex =
        (this.activeSearchIndex - 1 + this.searchResults.length) % this.searchResults.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.searchResults[this.activeSearchIndex];
      if (item) {
        this.goToSearchResult(item.url);
      }
    }
  }

  goToSearchResult(url: string): void {
    this.searchValue = '';
    this.searchResults = [];
    this.closeSearch();
    this.closeMenu();
    this.router.navigate(['/product', url]);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSearch();
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.searchWrapper && !this.searchWrapper.nativeElement.contains(target)) {
      this.closeSearch();
    }
  }

  private updateBodyScrollLock(): void {
    document.body.classList.toggle('is-scroll-locked', this.menuOpen);
    document.body.classList.toggle('header-menu-open', this.menuOpen);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('is-scroll-locked', 'header-menu-open');
  }
}
