import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductType, ProductsType } from '../../../types/product.type';
import { ActiveParamsType } from '../../../types/active-params.type';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) {
  }

  getProducts(params: ActiveParamsType): Observable<ProductsType> {
    let httpParams = new HttpParams();

    if (params.types && params.types.length > 0) {
      params.types.forEach(type => {
        httpParams = httpParams.append('types', type);
      });
    }

    if (params.heightFrom) {
      httpParams = httpParams.set('heightFrom', params.heightFrom);
    }
    if (params.heightTo) {
      httpParams = httpParams.set('heightTo', params.heightTo);
    }
    if (params.diameterFrom) {
      httpParams = httpParams.set('diameterFrom', params.diameterFrom);
    }
    if (params.diameterTo) {
      httpParams = httpParams.set('diameterTo', params.diameterTo);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<ProductsType>(environment.api + '/products', {
      params: httpParams
    });
  }

  getProduct(url: string): Observable<ProductType> {
    return this.http.get<ProductType>(environment.api + '/products/' + url);
  }

  searchProducts(query: string): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(environment.api + '/products/search', {
      params: { query }
    });
  }

  getBestProducts(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(environment.api + '/products/best');
  }
}
