import { DebugElement } from '@angular/core';
import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Observable, interval, of } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { Job } from '../../models/job.model';
import { SearchComponent } from './search.component';
import { SearchModule } from '../../search.module';
import { SearchService } from '../../search.service';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let service: SearchService;

  const searchServiceStub: Partial<SearchService> = {
    searchJobs: () => of([])
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SearchModule],
      providers: [{ provide: SearchService, useValue: searchServiceStub }]
    }).compileComponents();
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
      htmlInput = fixture.nativeElement.querySelector('input');
    });

    it('displays the appropriate message when no matches were found', fakeAsync(() => {
      spyOn(service, 'searchJobs').and.returnValue(
        of([{ suggestion: 'No results', isDisabled: true } as Job])
      );
      htmlInput.value = 'xxxxxxxxxxxxxxxxxxxx';
      htmlInput.dispatchEvent(new Event('input'));

      tick(300);
      fixture.detectChanges();
      htmlInput.dispatchEvent(new Event('focusin'));
      const optionDe = fixture.debugElement.query(
        By.css('.mat-option-disabled')
      );

      expect(optionDe.nativeElement.textContent).toContain('No results');
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

    it('displays a spinner while loading results', () => {
      expect(component).toBeTruthy();
    });
  });
});
