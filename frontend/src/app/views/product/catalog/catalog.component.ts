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
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { CategoryService } from '../../../shared/services/category.service';
import { ProductService } from '../../../shared/services/product.service';
import { ActiveParamsUtil } from '../../../shared/utils/active-params.util';
import { ActiveParamsType } from '../../../../types/active-params.type';
import { AppliedFilterType } from '../../../../types/applied-filter.type';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { ProductType } from '../../../../types/product.type';

type SortOption = { value: string; label: string };

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
  standalone: false
})
export class CatalogComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('sortSelect') sortSelect?: ElementRef<HTMLElement>;

  products: ProductType[] = [];
  categories: CategoryWithTypeType[] = [];
  appliedFilters: AppliedFilterType[] = [];
  activeParams: ActiveParamsType = { types: [] };
  pages: number[] = [];
  pagesCount = 0;
  currentPage = 1;

  loading = true;
  error = false;

  sortOpen = false;
  sortOptions: SortOption[] = [
    { value: 'az-asc', label: 'От А до Я' },
    { value: 'az-desc', label: 'От Я до А' },
    { value: 'price-asc', label: 'По возрастанию цены' },
    { value: 'price-desc', label: 'По убыванию цены' }
  ];

  filtersOpen = false;
  openAccordions = new Set<string>(['height']);

  heightFrom = '';
  heightTo = '';
  diameterFrom = '';
  diameterTo = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes().pipe(
      catchError(() => of([] as CategoryWithTypeType[])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(categories => {
      this.categories = categories;
      if (categories.length) {
        this.openAccordions.add(categories[0].url);
      }
      this.rebuildAppliedFilters();
    });

    this.activatedRoute.queryParams.pipe(
      tap(() => {
        this.loading = true;
        this.error = false;
      }),
      switchMap(params => {
        this.activeParams = ActiveParamsUtil.processParams(params);
        this.currentPage = this.activeParams.page || 1;
        this.heightFrom = this.activeParams.heightFrom || '';
        this.heightTo = this.activeParams.heightTo || '';
        this.diameterFrom = this.activeParams.diameterFrom || '';
        this.diameterTo = this.activeParams.diameterTo || '';
        this.rebuildAppliedFilters();

        return this.productService.getProducts(this.activeParams).pipe(
          catchError(() => {
            this.error = true;
            return of({ totalCount: 0, pages: 0, items: [] as ProductType[] });
          }),
          finalize(() => {
            this.loading = false;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.products = data.items;
      this.pagesCount = data.pages;
      this.pages = this.buildPages(data.pages, this.currentPage);
    });
  }

  get sortValue(): string {
    return this.activeParams.sort || '';
  }

  get selectedSortLabel(): string {
    return this.sortOptions.find(option => option.value === this.sortValue)?.label || 'Сортировать';
  }

  isTypeChecked(url: string): boolean {
    return this.activeParams.types.includes(url);
  }

  toggleType(url: string): void {
    const types = [...this.activeParams.types];
    const index = types.indexOf(url);
    if (index === -1) {
      types.push(url);
    } else {
      types.splice(index, 1);
    }
    this.navigate({ ...this.activeParams, types, page: 1 });
  }

  applyRangeFilters(): void {
    this.navigate({
      ...this.activeParams,
      heightFrom: this.heightFrom || undefined,
      heightTo: this.heightTo || undefined,
      diameterFrom: this.diameterFrom || undefined,
      diameterTo: this.diameterTo || undefined,
      page: 1
    });
  }

  toggleSort(event?: Event): void {
    event?.stopPropagation();
    this.sortOpen = !this.sortOpen;
  }

  selectSort(option: SortOption): void {
    this.sortOpen = false;
    this.navigate({ ...this.activeParams, sort: option.value, page: 1 });
  }

  isAccordionOpen(id: string): boolean {
    return this.openAccordions.has(id);
  }

  toggleAccordion(id: string): void {
    if (this.openAccordions.has(id)) {
      this.openAccordions.delete(id);
    } else {
      this.openAccordions.add(id);
    }
  }

  openFilters(): void {
    this.filtersOpen = true;
    document.body.classList.add('is-scroll-locked');
  }

  closeFilters(): void {
    this.filtersOpen = false;
    document.body.classList.remove('is-scroll-locked');
  }

  applyFilters(): void {
    this.applyRangeFilters();
    this.closeFilters();
  }

  resetFilters(): void {
    this.heightFrom = '';
    this.heightTo = '';
    this.diameterFrom = '';
    this.diameterTo = '';
    this.navigate({
      types: [],
      sort: this.activeParams.sort,
      page: 1
    });
  }

  removeFilter(filter: AppliedFilterType): void {
    if (filter.urlParam === 'heightFrom' || filter.urlParam === 'heightTo') {
      this.heightFrom = '';
      this.heightTo = '';
      this.navigate({
        ...this.activeParams,
        heightFrom: undefined,
        heightTo: undefined,
        page: 1
      });
      return;
    }
    if (filter.urlParam === 'diameterFrom' || filter.urlParam === 'diameterTo') {
      this.diameterFrom = '';
      this.diameterTo = '';
      this.navigate({
        ...this.activeParams,
        diameterFrom: undefined,
        diameterTo: undefined,
        page: 1
      });
      return;
    }

    this.toggleType(filter.urlParam);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.pagesCount || page === this.currentPage) {
      return;
    }
    this.navigate({ ...this.activeParams, page });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.sortOpen) {
      return;
    }
    const select = this.sortSelect?.nativeElement;
    if (select && !select.contains(event.target as Node)) {
      this.sortOpen = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }
    if (this.sortOpen) {
      this.sortOpen = false;
    }
    if (this.filtersOpen) {
      this.closeFilters();
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('is-scroll-locked');
  }

  private navigate(params: ActiveParamsType): void {
    const queryParams = ActiveParamsUtil.toQueryParams(params);
    this.router.navigate(['/catalog'], { queryParams });
  }

  private rebuildAppliedFilters(): void {
    const filters: AppliedFilterType[] = [];

    this.activeParams.types.forEach(typeUrl => {
      for (const category of this.categories) {
        const type = category.types.find(item => item.url === typeUrl);
        if (type) {
          filters.push({ name: type.name, urlParam: type.url });
          break;
        }
      }
    });

    if (this.activeParams.heightFrom || this.activeParams.heightTo) {
      const from = this.activeParams.heightFrom || '…';
      const to = this.activeParams.heightTo || '…';
      filters.push({
        name: `Высота: ${from}–${to} см`,
        urlParam: 'heightFrom'
      });
    }

    if (this.activeParams.diameterFrom || this.activeParams.diameterTo) {
      const from = this.activeParams.diameterFrom || '…';
      const to = this.activeParams.diameterTo || '…';
      filters.push({
        name: `Диаметр: ${from}–${to} см`,
        urlParam: 'diameterFrom'
      });
    }

    this.appliedFilters = filters;
  }

  private buildPages(pagesCount: number, currentPage: number): number[] {
    if (pagesCount <= 0) {
      return [];
    }
    if (pagesCount <= 5) {
      return Array.from({ length: pagesCount }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, pagesCount, currentPage]);
    if (currentPage > 1) {
      pages.add(currentPage - 1);
    }
    if (currentPage < pagesCount) {
      pages.add(currentPage + 1);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }
}
