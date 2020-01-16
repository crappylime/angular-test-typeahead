import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss'],
})
export class SearchComponent implements OnInit {
  myControl = new FormControl();
  filteredOptions$: Observable<string[]>;

  constructor(private service: SearchService) { }

  ngOnInit() {
    this.filteredOptions$ = this.myControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string) =>
          value.length < 2
            ? of([])
            : this.service.searchWords(value.toLowerCase())
        ),
      );
  }
}
