import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
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
  isLoading = false;
  jobId: string;
  jobs$: Observable<Job[]>;
  searchControl = new FormControl();

  constructor(private service: SearchService) {}

  ngOnInit() {
    this.jobs$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.isLoading = true)),
      switchMap((value: string) =>
        !value || value.length < 2
          ? of([])
          : this.service.searchJobs(value.toLowerCase())
      ),
      tap(() => (this.isLoading = false))
    );
  }

  clear() {
    this.searchControl.setValue('');
    this.jobId = '';
  }
}
