import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private url = 'https://api.datamuse.com/sug';

  constructor(private http: HttpClient) { }

  searchWords(term: string): Observable<string[]> {
    return this.http
      .get<{ word: string, score: number }[]>(this.url, {
        params: new HttpParams().set('s', term)
      })
      .pipe(
        map(response => response.map(obj => obj.word))
      );
  }

}
