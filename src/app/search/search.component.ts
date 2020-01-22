import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { MatOption } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

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

  private readonly noResultsMessage = 'No results';

  constructor(private service: SearchService) { }

  ngOnInit() {
    this.titles$ = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoading = true),
        switchMap((value: string) =>
          !value || value.length < 2
            ? of([])
            : this.service.searchTitles(value.toLowerCase()).pipe(
              catchError(() => of([this.noResultsMessage]))
            )
        ),
        tap(() => this.isLoading = false)
      );
  }

  onSelectedOption(option: MatOption, title: string) {
    if (title === this.noResultsMessage) {
      option.deselect();
      this.searchControl.reset();
    }
  }
}
