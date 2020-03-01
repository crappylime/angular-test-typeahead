import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { SearchModule } from '../../search.module';
import { SearchService } from '../../search.service';
import { SkillsComponent } from './skills.component';

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;
  let service: SearchService;

  const searchServiceStub: Partial<SearchService> = {
    getSkills: () => of([])
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SearchModule],
      providers: [{ provide: SearchService, useValue: searchServiceStub }]
    }).compileComponents();
    service = TestBed.inject(SearchService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
