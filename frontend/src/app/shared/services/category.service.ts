import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryType, TypeType } from '../../../types/category.type';
import { CategoryWithTypeType } from '../../../types/category-with-type.type';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<CategoryType[]> {
    return this.http.get<CategoryType[]>(environment.api + '/categories');
  }

  getTypes(): Observable<TypeType[]> {
    return this.http.get<TypeType[]>(environment.api + '/types');
  }

  getCategoriesWithTypes(): Observable<CategoryWithTypeType[]> {
    return this.http.get<TypeType[]>(environment.api + '/types')
      .pipe(
        map((types: TypeType[]) => {
          const array: CategoryWithTypeType[] = [];

          types.forEach((type: TypeType) => {
            const foundItem = array.find(item => item.url === type.category.url);
            if (foundItem) {
              foundItem.types.push({
                id: type.id,
                name: type.name,
                url: type.url
              });
            } else {
              array.push({
                id: type.category.id,
                name: type.category.name,
                url: type.category.url,
                types: [{
                  id: type.id,
                  name: type.name,
                  url: type.url
                }]
              });
            }
          });

          return array;
        })
      );
  }
}
