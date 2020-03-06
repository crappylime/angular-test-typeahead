import { DebugElement, Component, Input } from '@angular/core';
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
  });

  describe('#ngOnInit', () => {
    let htmlInput: HTMLInputElement;

    beforeEach(() => {
      // get the search input from the DOM
      htmlInput = fixture.nativeElement.querySelector('input');
    });

    it('displays the appropriate message when no matches were found', fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ suggestion: 'No results', isDisabled: true } as Job])
      );
      // simulate user entering a new value into the input box
      htmlInput.value = 'xxxxxxxxxxxxxxxxxxxx';
      // dispatch a DOM event so that Angular learns of input value change
      htmlInput.dispatchEvent(new Event('input'));

      // wait for async debounceTime to complete
      tick(300);
      // Tell Angular to update the display binding
      fixture.detectChanges();
      htmlInput.dispatchEvent(new Event('focusin'));
      const optionDe = fixture.debugElement.query(
        By.css('.mat-option-disabled')
      );

      expect(optionDe.nativeElement.textContent).toContain('No results');
    }));

    it('displays a spinner while loading results', fakeAsync(() => {
      let optionDe: DebugElement;
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ suggestion: 'Chief Officer' } as Job]).pipe(delay(200))
      );
      htmlInput.value = 'ch';
      htmlInput.dispatchEvent(new Event('input'));

      tick(300);
      fixture.detectChanges();
      htmlInput.dispatchEvent(new Event('focusin'));
      optionDe = fixture.debugElement.query(By.css('.mat-spinner'));
      expect(optionDe).toBeTruthy();

      tick(200);
      fixture.detectChanges();
      htmlInput.dispatchEvent(new Event('focusin'));
      optionDe = fixture.debugElement.query(By.css('.mat-spinner'));
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
            htmlInput.value = chars;
            htmlInput.dispatchEvent(new Event('input'));
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
      let childEl: HTMLElement;
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ uuid: '1', suggestion: 'Chief Officer' } as Job])
      );
      htmlInput.value = 'ch';
      htmlInput.dispatchEvent(new Event('input'));

      tick(300);
      fixture.detectChanges();
      childEl = fixture.nativeElement.querySelector('app-skills');
      expect(childEl).toBeFalsy();
      htmlInput.dispatchEvent(new Event('focusin'));
      const optionDe = fixture.debugElement.query(By.css('.mat-option'));

      optionDe.triggerEventHandler('onSelectionChange', null);
      fixture.detectChanges();
      childEl = fixture.nativeElement.querySelector('app-skills');
      // console.log(childEl);
      expect(childEl).toBeTruthy();
    }));

    describe('when the child component is visible', () => {
      it('changes after selecting another option', fakeAsync(() => {
        let childEl: HTMLElement;
        let optionDes: DebugElement[];
        spyOn(service, 'searchJobs').and.returnValue(
          of([
            { uuid: '1', suggestion: 'Chief Officer' } as Job,
            { uuid: '2', suggestion: 'Chief Developer' } as Job
          ])
        );
        htmlInput.value = 'ch';
        htmlInput.dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();
        htmlInput.dispatchEvent(new Event('focusin'));
        optionDes = fixture.debugElement.queryAll(By.css('.mat-option'));
        console.log(optionDes);
        optionDes[0].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        childEl = fixture.nativeElement.querySelector('app-skills');
        expect(component.jobId).toEqual('1');
        expect(childEl).toBeTruthy();

        htmlInput.dispatchEvent(new Event('focusin'));
        optionDes = fixture.debugElement.queryAll(By.css('.mat-option'));
        optionDes[1].triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        childEl = fixture.nativeElement.querySelector('app-skills');
        expect(component.jobId).toEqual('2');
        expect(childEl).toBeTruthy();
      }));

      it('disappears after clearing an option', fakeAsync(() => {
        let childEl: HTMLElement;
        spyOn(service, 'searchJobs').and.returnValue(
          of([{ uuid: '1', suggestion: 'Chief Officer' } as Job])
        );
        htmlInput.value = 'ch';
        htmlInput.dispatchEvent(new Event('input'));

        tick(300);
        fixture.detectChanges();
        htmlInput.dispatchEvent(new Event('focusin'));
        const optionDe = fixture.debugElement.query(By.css('.mat-option'));
        optionDe.triggerEventHandler('onSelectionChange', null);
        fixture.detectChanges();
        childEl = fixture.nativeElement.querySelector('app-skills');
        expect(childEl).toBeTruthy();

        const clearDe = fixture.debugElement.query(By.css('.mat-icon-button'));
        clearDe.triggerEventHandler('click', null);
        tick(300);
        fixture.detectChanges();
        childEl = fixture.nativeElement.querySelector('app-skills');
        expect(childEl).toBeFalsy();
        tick();
      }));
    });
  });
});
