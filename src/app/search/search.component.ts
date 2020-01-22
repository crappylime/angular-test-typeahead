import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';

import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss'],
})
export class SearchComponent implements OnInit {
  isLoading = false;
  searchControl = new FormControl();
  titles$: Observable<string[]>;

  constructor(private service: SearchService) { }

  ngOnInit() {
    this.titles$ = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoading = true),
        switchMap((value: string) =>
          value.length < 2
            ? of([])
            : this.service.searchTitles(value.toLowerCase())
        ),
        tap(() => this.isLoading = false),
        finalize(() => this.isLoading = false)
      );
  }
}
