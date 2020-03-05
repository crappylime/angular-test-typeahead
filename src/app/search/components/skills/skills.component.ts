import { Component, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SearchService } from '../../search.service';
import { Skill } from '../../models/skill.model';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  displayedColumns: string[] = [
    'skill_name',
    'skill_type',
    'description',
    'importance',
    'level'
  ];
  isLoading = false;
  skills$: Observable<Skill[]>;

  @Input() set jobId(id: string) {
    this._jobId = id;
    this.isLoading = true;
    this.skills$ = this.service
      .getSkills(this.jobId)
      .pipe(finalize(() => (this.isLoading = false)));
  }

  get jobId(): string {
    return this._jobId;
  }

  private _jobId: string;

  constructor(private service: SearchService) {}
}
