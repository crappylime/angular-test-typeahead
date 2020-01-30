import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private url = 'http://api.dataatwork.org/v1/jobs';

  constructor(private http: HttpClient) {}

  searchTitles(term: string): Observable<string[]> {
    return this.http
      .get<{ suggestion: string }[]>(`${this.url}/autocomplete`, {
        params: new HttpParams().set('contains', term)
      })
      .pipe(map(response => response.map(obj => obj.suggestion)));
  }
}
