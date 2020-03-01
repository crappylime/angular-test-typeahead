import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SearchService } from '../../search.service';
import { Skill } from '../../models/skill.model';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  displayedColumns: string[] = [
    'skill_name',
    'skill_type',
    'description',
    'importance',
    'level'
  ];
  isLoading = false;
  skills$: Observable<Skill[]>;

  @Input() jobId: string;

  constructor(private service: SearchService) {}

  ngOnInit() {
    this.isLoading = true;
    this.skills$ = this.service
      .getSkills(this.jobId)
      .pipe(finalize(() => (this.isLoading = false)));
  }
}
