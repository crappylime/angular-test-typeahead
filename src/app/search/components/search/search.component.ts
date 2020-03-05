import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { Job } from '../../models/job.model';
import { SearchService } from '../../search.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})
export class SearchComponent implements OnInit {
  readonly noResultsMessage = 'No results';

  isLoading = false;
  jobId: string;
  searchControl = new FormControl();
  jobs$: Observable<Job[]>;

  constructor(private service: SearchService) {}

  ngOnInit() {
    this.jobs$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.isLoading = true)),
      map((value: string | Job) => {
        if (typeof value !== 'string') {
          value = value.suggestion;
        }
        return value;
      }),
      switchMap((value: string) =>
        !value || value.length < 2
          ? of([])
          : this.service
              .searchJobs(value.toLowerCase())
              .pipe(
                catchError((error: HttpErrorResponse) =>
                  error.status === 404
                    ? of([{ suggestion: this.noResultsMessage } as Job])
                    : throwError(error)
                )
              )
      ),
      tap(() => (this.isLoading = false))
    );
  }

  clear() {
    this.searchControl.setValue('');
    this.jobId = '';
  }

  displayJobTitle(job: Job): string {
    return job?.suggestion;
  }

  onSelect(event: MatAutocompleteSelectedEvent) {
    this.jobId = (event.option.value as Job).uuid;
  }
}
