import { Params } from '@angular/router';
import { ActiveParamsType } from '../../../types/active-params.type';

export class ActiveParamsUtil {
  static processParams(params: Params): ActiveParamsType {
    const activeParams: ActiveParamsType = { types: [] };

    if (params['types']) {
      activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
    }

    if (params['heightFrom']) {
      activeParams.heightFrom = params['heightFrom'];
    }
    if (params['heightTo']) {
      activeParams.heightTo = params['heightTo'];
    }
    if (params['diameterFrom']) {
      activeParams.diameterFrom = params['diameterFrom'];
    }
    if (params['diameterTo']) {
      activeParams.diameterTo = params['diameterTo'];
    }
    if (params['sort']) {
      activeParams.sort = params['sort'];
    }
    if (params['page']) {
      activeParams.page = +params['page'];
    }

    return activeParams;
  }

  static toQueryParams(activeParams: ActiveParamsType): Params {
    const queryParams: Params = {};

    if (activeParams.types && activeParams.types.length > 0) {
      queryParams['types'] = activeParams.types;
    }
    if (activeParams.heightFrom) {
      queryParams['heightFrom'] = activeParams.heightFrom;
    }
    if (activeParams.heightTo) {
      queryParams['heightTo'] = activeParams.heightTo;
    }
    if (activeParams.diameterFrom) {
      queryParams['diameterFrom'] = activeParams.diameterFrom;
    }
    if (activeParams.diameterTo) {
      queryParams['diameterTo'] = activeParams.diameterTo;
    }
    if (activeParams.sort) {
      queryParams['sort'] = activeParams.sort;
    }
    if (activeParams.page && activeParams.page > 1) {
      queryParams['page'] = activeParams.page;
    }

    return queryParams;
  }
}
