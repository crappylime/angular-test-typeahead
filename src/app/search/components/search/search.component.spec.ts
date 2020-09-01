//#region imports
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
//#endregion

@Component({ selector: 'app-skills', template: '' })
class SkillsStubComponent {
  @Input() jobId: string;
}

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let searchInput: HTMLInputElement;
  let service: SearchService;
  const debounceTimeValue = 300;
  const searchServiceStub: Partial<SearchService> = {
    searchJobs: () => of([])
  };

  // query helpers
  const query = <T>(selector: string): T =>
    fixture.nativeElement.querySelector(selector);
  const queryByCss = (selector: string): DebugElement =>
    fixture.debugElement.query(By.css(selector));
  const queryAllByCss = (selector: string): DebugElement[] =>
    fixture.debugElement.queryAll(By.css(selector));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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

  // wrap a function to be executed in the fakeAsync zone where timers are synchronous
  it('displays the appropriate message when no matches were found', fakeAsync(() => {
    const noResultsMessage = 'No results';
    spyOn(service, 'searchJobs').and.returnValue(
      of([{ suggestion: noResultsMessage, isDisabled: true } as Job])
    );

    // simulate user entering a new value into the input box
    searchInput.value = 'xxxxxxxxxxxxxxxxxxxx';

    // dispatch a DOM event to trigger the form control value change
    searchInput.dispatchEvent(new Event('input'));

    // simulate the asynchronous passage of time and wait for the async debounceTime to complete
    tick(debounceTimeValue);

    // tell Angular to update the display binding
    fixture.detectChanges();

    // open the panel when the input is focused
    searchInput.dispatchEvent(new Event('focusin'));
    const optionDebugEl = queryByCss('.mat-option-disabled');

    expect(optionDebugEl.nativeElement.textContent).toContain(noResultsMessage);
  }));

  it('displays a spinner while loading results', fakeAsync(() => {
    let spinnerDebugEl: DebugElement;
    const serverDelayTimeValue = 200;
    spyOn(service, 'searchJobs').and.returnValue(
      of([{ suggestion: 'Chief Officer' } as Job]).pipe(
        delay(serverDelayTimeValue)
      )
    );
    searchInput.value = 'ch';
    searchInput.dispatchEvent(new Event('input'));

    tick(debounceTimeValue);
    fixture.detectChanges();
    searchInput.dispatchEvent(new Event('focusin'));
    spinnerDebugEl = queryByCss('.mat-spinner');
    expect(spinnerDebugEl).toBeTruthy();

    tick(serverDelayTimeValue);
    fixture.detectChanges();
    searchInput.dispatchEvent(new Event('focusin'));
    spinnerDebugEl = queryByCss('.mat-spinner');
    expect(spinnerDebugEl).toBeFalsy();

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
        spyOn(service, 'searchJobs').and.returnValue(
          of([{ suggestion: 'Chief Technical Officer' } as Job])
        );
        const typedTextMock$: Observable<string> = interval(intervalTime).pipe(
          take(typedText.length),
          map(index => typedText[index])
        );

        typedTextMock$.subscribe(chars => {
          searchInput.value = chars;
          searchInput.dispatchEvent(new Event('input'));
        });
        tick(typedText.length * intervalTime + debounceTimeValue);
        fixture.detectChanges();

        expect(service.searchJobs).toHaveBeenCalledTimes(expectedNumberOfCalls);
      }));
    };

    test('quickly', ['te', 'tec', 'tech'], 1);
    test('slowly', ['te', 'tec', 'tech'], 3, 400);
    test('quickly only one char', ['t'], 0);
    test('slowly two chars', ['t', 'te'], 1, 400);
    test('slowly the same several times', ['te', 'te', 'te'], 1, 400);
  });

  describe('a nested skills component', () => {
    let skillsEl: HTMLElement;
    let optionDebugEls: DebugElement[];

    beforeEach(fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([
          { uuid: '1', suggestion: 'Chief Officer' } as Job,
          { uuid: '2', suggestion: 'Chief Developer' } as Job
        ])
      );
      searchInput.value = 'ch';
      searchInput.dispatchEvent(new Event('input'));
      tick(debounceTimeValue);
      fixture.detectChanges();
    }));

    it('skills are not visible before selecting any option', () => {
      skillsEl = query('app-skills');
      expect(skillsEl).toBeFalsy();
    });

    describe('when option is selected', () => {
      beforeEach(() => {
        searchInput.dispatchEvent(new Event('focusin'));
        optionDebugEls = queryAllByCss('.mat-option');
        optionDebugEls[0].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        skillsEl = query('app-skills');
      });

      it('skills are visible', fakeAsync(() => {
        expect(skillsEl).toBeTruthy();
      }));

      it('jobId changes after selecting another option', fakeAsync(() => {
        expect(component.jobId).toEqual('1');

        searchInput.dispatchEvent(new Event('focusin'));
        optionDebugEls = queryAllByCss('.mat-option');
        optionDebugEls[1].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        skillsEl = query('app-skills');

        expect(component.jobId).toEqual('2');
      }));

      it('skills disappear after clearing', fakeAsync(() => {
        const clearDebugEl = queryByCss('.mat-icon-button');
        clearDebugEl.triggerEventHandler('click', null);
        fixture.detectChanges();
        skillsEl = query('app-skills');

        expect(skillsEl).toBeFalsy();
      }));
    });
  });
});
