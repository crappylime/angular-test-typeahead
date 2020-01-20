import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Observable, interval, of } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { SearchComponent } from './search.component';
import { SearchModule } from './search.module';
import { SearchService } from './search.service';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let service: SearchService;

  const searchServiceStub: Partial<SearchService> = {
    searchWords: () => of([])
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SearchModule],
      providers: [
        { provide: SearchService, useValue: searchServiceStub }
      ]
    })
      .compileComponents();
    service = TestBed.get(SearchService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('search words', () => {
    let htmlInput: HTMLInputElement;

    beforeEach(() => {
      htmlInput = fixture.nativeElement.querySelector('input');
    });

    it('begins search with min 2 characters', () => {
      expect(component).toBeTruthy();
    });

    describe('if user has been typing chars', () => {
      const test = (
        description: string,
        intervalTime: number,
        expectedNumberOfCalls: number,
        debounceTimeValue = 300
      ) => {
        it(`with ${description} than ${debounceTimeValue}ms then call the service ${expectedNumberOfCalls} time/-s`, fakeAsync(() => {
          const numberOfUserChanges = 3;
          spyOn(service, 'searchWords').and.returnValue(of(['tech talk']));
          const inputTextArray = ['te', 'tec', 'tech'];
          const textMock$: Observable<string> = interval(intervalTime).pipe(
            take(numberOfUserChanges),
            map(index => inputTextArray[index])
          );

          textMock$.subscribe(char => {
            htmlInput.value = char;
            htmlInput.dispatchEvent(new Event('input'));
          });
          tick(numberOfUserChanges * intervalTime + debounceTimeValue);
          fixture.detectChanges();

          expect(service.searchWords).toHaveBeenCalledTimes(expectedNumberOfCalls);
        }));
      };

      test('breaks that are shorter', 100, 1);
      test('breaks that are greater', 301, 3);
    });

    it('is not calling the service if the same value has been typed again', () => {
      expect(component).toBeTruthy();
    });

    it('displays an alert when no matches were found', () => {
      expect(component).toBeTruthy();
    });
  });
});
