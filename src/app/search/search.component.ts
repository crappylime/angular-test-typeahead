import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';

import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})
export class SearchComponent implements OnInit {
  readonly noResultsMessage = 'No results';

  isLoading = false;
  searchControl = new FormControl();
  titles$: Observable<string[]>;

  constructor(private service: SearchService) {}

  ngOnInit() {
    this.titles$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.isLoading = true)),
      switchMap((value: string) =>
        !value || value.length < 2
          ? of([])
          : this.service
              .searchTitles(value.toLowerCase())
              .pipe(
                catchError((error: HttpErrorResponse) =>
                  error.status === 404
                    ? of([this.noResultsMessage])
                    : throwError(error)
                )
              )
      ),
      tap(() => (this.isLoading = false))
    );
  }
}
