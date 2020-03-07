import { Component, DebugElement, Input } from '@angular/core';
import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Observable, interval, of } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { Job } from '../../models/job.model';
import { SearchComponent } from './search.component';
import { SearchService } from '../../search.service';
import { SearchModule } from '../../search.module';
import { SkillsComponent } from '../skills/skills.component';

@Component({ selector: 'app-skills', template: '' })
class SkillsStubComponent {
  @Input() jobId: string;
}

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let service: SearchService;

  const searchServiceStub: Partial<SearchService> = {
    searchJobs: () => of([])
  };

  // template elements
  let searchInput: HTMLInputElement;

  // query helpers
  const query = <T>(selector: string): T =>
    fixture.nativeElement.querySelector(selector);
  const queryByCss = (selector: string): DebugElement =>
    fixture.debugElement.query(By.css(selector));
  const queryAllByCss = (selector: string): DebugElement[] =>
    fixture.debugElement.queryAll(By.css(selector));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [SearchModule],
      providers: [{ provide: SearchService, useValue: searchServiceStub }]
    })
      .overrideModule(SearchModule, {
        // Replace the real SkillsComponent with the stub
        remove: {
          declarations: [SkillsComponent]
        },
        add: {
          declarations: [SkillsStubComponent]
        }
      })
      .compileComponents();
    service = TestBed.inject(SearchService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // get the search input from the DOM
    searchInput = query('input');
  });

  describe('#ngOnInit', () => {
    let optionDe: DebugElement;

    it('displays the appropriate message when no matches were found', fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ suggestion: 'No results', isDisabled: true } as Job])
      );

      // simulate user entering a new value into the input box
      searchInput.value = 'xxxxxxxxxxxxxxxxxxxx';

      // dispatch a DOM event so that Angular learns of input value change
      searchInput.dispatchEvent(new Event('input'));

      // wait for async debounceTime to complete
      tick(300);

      // Tell Angular to update the display binding
      fixture.detectChanges();
      searchInput.dispatchEvent(new Event('focusin'));
      optionDe = queryByCss('.mat-option-disabled');

      expect(optionDe.nativeElement.textContent).toContain('No results');
    }));

    it('displays a spinner while loading results', fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ suggestion: 'Chief Officer' } as Job]).pipe(delay(200))
      );
      searchInput.value = 'ch';
      searchInput.dispatchEvent(new Event('input'));

      tick(300);
      fixture.detectChanges();
      searchInput.dispatchEvent(new Event('focusin'));
      optionDe = queryByCss('.mat-spinner');
      expect(optionDe).toBeTruthy();

      tick(200);
      fixture.detectChanges();
      searchInput.dispatchEvent(new Event('focusin'));
      optionDe = queryByCss('.mat-spinner');
      expect(optionDe).toBeFalsy();

      tick();
    }));

    describe('when user types', () => {
      const test = (
        description: string,
        typedText: string[],
        expectedNumberOfCalls: number,
        intervalTime = 100
      ) => {
        it(`${description}, call the service ${expectedNumberOfCalls} time/-s`, fakeAsync(() => {
          const debounceTimeValue = 300;
          spyOn(service, 'searchJobs').and.returnValue(
            of([{ suggestion: 'Chief Technical Officer' } as Job])
          );
          const typedTextMock$: Observable<string> = interval(
            intervalTime
          ).pipe(
            take(typedText.length),
            map(index => typedText[index])
          );

          typedTextMock$.subscribe(chars => {
            searchInput.value = chars;
            searchInput.dispatchEvent(new Event('input'));
          });
          tick(typedText.length * intervalTime + debounceTimeValue);
          fixture.detectChanges();

          expect(service.searchJobs).toHaveBeenCalledTimes(
            expectedNumberOfCalls
          );
        }));
      };

      test('quickly', ['te', 'tec', 'tech'], 1);
      test('slowly', ['te', 'tec', 'tech'], 3, 400);
      test('quickly only one char', ['t'], 0);
      test('slowly two chars', ['t', 'te'], 1, 400);
      test('slowly the same several times', ['te', 'te', 'te'], 1, 400);
    });
  });

  describe('a nested skills component', () => {
    let skillsEl: HTMLElement;
    let optionDes: DebugElement[];

    beforeEach(fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([
          { uuid: '1', suggestion: 'Chief Officer' } as Job,
          { uuid: '2', suggestion: 'Chief Developer' } as Job
        ])
      );
      searchInput.value = 'ch';
      searchInput.dispatchEvent(new Event('input'));
      tick(300);
      fixture.detectChanges();
    }));

    it('skills are not visible before selecting any option', () => {
      skillsEl = query('app-skills');
      expect(skillsEl).toBeFalsy();
    });

    describe('when option is selected', () => {
      beforeEach(() => {
        searchInput.dispatchEvent(new Event('focusin'));
        optionDes = queryAllByCss('.mat-option');
        optionDes[0].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        skillsEl = query('app-skills');
      });

      it('skills are visible', fakeAsync(() => {
        expect(skillsEl).toBeTruthy();
      }));

      it('skills update after selecting another option', fakeAsync(() => {
        expect(component.jobId).toEqual('1');

        searchInput.dispatchEvent(new Event('focusin'));
        optionDes = queryAllByCss('.mat-option');
        optionDes[1].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        skillsEl = query('app-skills');

        expect(skillsEl).toBeTruthy();
        expect(component.jobId).toEqual('2');
      }));

      it('skills disappear after clearing', fakeAsync(() => {
        const clearDe = queryByCss('.mat-icon-button');
        clearDe.triggerEventHandler('click', null);
        tick(300);
        fixture.detectChanges();
        skillsEl = query('app-skills');

        expect(skillsEl).toBeFalsy();
        tick();
      }));
    });
  });
});
