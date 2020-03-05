import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Job } from './models/job.model';
import { ApiSkill, Skill } from './models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private url = 'http://api.dataatwork.org/v1/jobs';

  constructor(private http: HttpClient) {}

  searchJobs(term: string): Observable<Job[]> {
    return this.http
      .get<Job[]>(`${this.url}/autocomplete`, {
        params: new HttpParams().set('contains', term)
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          error.status === 404
            ? of([{ suggestion: 'No results', isDisabled: true } as Job])
            : []
        )
      );
  }

  getSkills(jobId: string): Observable<Skill[]> {
    return this.http
      .get<{ skills: ApiSkill[] }>(`${this.url}/${jobId}/related_skills`)
      .pipe(
        map(response =>
          response.skills.map(skill => ({
            ...skill,
            name: skill.skill_name,
            type: skill.skill_type
          }))
        )
      );
  }
}
