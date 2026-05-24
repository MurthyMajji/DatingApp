import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, identity, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

type CacheEntry = {
  response: HttpResponse<unknown>;
  timeStamp: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5mins

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  // const generateCacheKey = (url: string, params: HttpParams): string => {
  //   const paramString = params
  //     .keys()
  //     .map((key) => `${key}==${params.get(key)}`)
  //     .join('&');

  //   return paramString ? `${url}?${paramString}` : url;
  // };
  // const cacheKey = generateCacheKey(req.url, req.params);

  // Instead of using the above logic, we can use Built-in Angular way to get URL + Params

  const cacheKey = req.urlWithParams;

  const invalidateCache = (urlPattern: string) => {
    cache.forEach((value, key) => {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    });
  };

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      const isExpired = Date.now() - cachedResponse.timeStamp > CACHE_DURATION_MS;
      if (!isExpired) {
        return of(cachedResponse.response);
      } else {
        cache.delete(cacheKey);
      }
    }
  }

  if (req.method == 'POST' && req.url.includes('/likes')) {
    invalidateCache('/likes');
  }
  if (req.method == 'POST' && req.url.includes('/messages')) {
    invalidateCache('/messages');
  }

  if (req.method === 'POST' && req.url.includes('/logout')) {
    cache.clear();
  }

  busyService.busy();

  return next(req).pipe(
    environment.production ? identity : delay(500),
    tap((response) => {
      if (response instanceof HttpResponse && req.method === 'GET') {
        cache.set(cacheKey, {
          response,
          timeStamp: Date.now(),
        });
      }
    }),
    finalize(() => {
      busyService.idle();
    }),
  );
};
