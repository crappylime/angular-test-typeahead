import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Job } from './models/job.model';
import { Skill } from './models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private url = 'http://api.dataatwork.org/v1/jobs';

  constructor(private http: HttpClient) {}

  searchJobs(term: string): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.url}/autocomplete`, {
      params: new HttpParams().set('contains', term)
    });
  }

  getSkills(jobId: string): Observable<Skill[]> {
    return this.http
      .get<{ skills: Skill[] }>(`${this.url}/${jobId}/related_skills`, {})
      .pipe(map(response => response.skills));
  }
}
