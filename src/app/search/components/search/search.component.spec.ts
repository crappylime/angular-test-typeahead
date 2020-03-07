import { Component, DebugElement, Input } from '@angular/core';
import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Observable, interval, of } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { Job } from '../../models/job.model';
import { SearchComponent } from './search.component';
import { SearchService } from '../../search.service';

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
  let childEl: HTMLElement;
  let optionDe: DebugElement;
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
      declarations: [SearchComponent, SkillsStubComponent],
      imports: [
        // SearchModule // importing a feature module will import real components declarations
        // https://github.com/angular/angular/issues/24607
        BrowserAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ReactiveFormsModule
      ],
      providers: [{ provide: SearchService, useValue: searchServiceStub }]
    })

      // override does not provide a way to replace the component logic
      // .overrideComponent(SkillsComponent, {
      //   set: {
      //     template: '<table></table>'
      //   }
      // })

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

    it('after selecting an option the child component should be visible', fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ uuid: '1', suggestion: 'Chief Officer' } as Job])
      );
      searchInput.value = 'ch';
      searchInput.dispatchEvent(new Event('input'));

      tick(300);
      fixture.detectChanges();
      childEl = query('app-skills');
      expect(childEl).toBeFalsy();
      searchInput.dispatchEvent(new Event('focusin'));
      optionDe = queryByCss('.mat-option');

      optionDe.triggerEventHandler('onSelectionChange', null);
      fixture.detectChanges();
      childEl = query('app-skills');
      // console.log(childEl);
      expect(childEl).toBeTruthy();
    }));

    describe('when the child component is visible', () => {
      it('changes after selecting another option', fakeAsync(() => {
        let optionDes: DebugElement[];
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
        searchInput.dispatchEvent(new Event('focusin'));
        optionDes = queryAllByCss('.mat-option');
        optionDes[0].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        childEl = query('app-skills');
        expect(component.jobId).toEqual('1');
        expect(childEl).toBeTruthy();

        searchInput.dispatchEvent(new Event('focusin'));
        optionDes = queryAllByCss('.mat-option');
        optionDes[1].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        childEl = query('app-skills');
        expect(component.jobId).toEqual('2');
        expect(childEl).toBeTruthy();
      }));

      it('disappears after clearing an option', fakeAsync(() => {
        spyOn(service, 'searchJobs').and.returnValue(
          of([{ uuid: '1', suggestion: 'Chief Officer' } as Job])
        );
        searchInput.value = 'ch';
        searchInput.dispatchEvent(new Event('input'));

        tick(300);
        fixture.detectChanges();
        searchInput.dispatchEvent(new Event('focusin'));
        optionDe = queryByCss('.mat-option');
        optionDe.triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        childEl = query('app-skills');
        expect(childEl).toBeTruthy();

        const clearDe = queryByCss('.mat-icon-button');
        clearDe.triggerEventHandler('click', null);
        tick(300);
        fixture.detectChanges();
        childEl = query('app-skills');
        expect(childEl).toBeFalsy();
        tick();
      }));
    });
  });
});
