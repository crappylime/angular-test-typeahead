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

  describe('#ngOnInit', () => {
    let htmlInput: HTMLInputElement;

    beforeEach(() => {
      htmlInput = fixture.nativeElement.querySelector('input');
    });

    describe('when user types', () => {
      const test = (
        description: string,
        typedText: string[],
        expectedNumberOfCalls: number,
        intervalTime = 100
      ) => {
        it(`${description}, call the service ${expectedNumberOfCalls} time/-s`, fakeAsync(() => {
          const debounceTimeValue = 300;
          spyOn(service, 'searchWords').and.returnValue(of(['tech talk']));
          const typedTextMock$: Observable<string> = interval(intervalTime).pipe(
            take(typedText.length),
            map(index => typedText[index])
          );

          typedTextMock$.subscribe(chars => {
            htmlInput.value = chars;
            htmlInput.dispatchEvent(new Event('input'));
          });
          tick(typedText.length * intervalTime + debounceTimeValue);
          fixture.detectChanges();

          expect(service.searchWords).toHaveBeenCalledTimes(expectedNumberOfCalls);
        }));
      };

      test('quickly', ['te', 'tec', 'tech'], 1);
      test('slowly', ['te', 'tec', 'tech'], 3, 400);
      test('quickly only one char', ['t'], 0);
      test('slowly two chars', ['t', 'te'], 1, 400);
      test('slowly the same several times', ['te', 'te', 'te'], 1, 400);
    });

    it('displays an alert when no matches were found', () => {
      expect(component).toBeTruthy();
    });

    it('displays a spinner while loading results', () => {
      expect(component).toBeTruthy();
    });
  });
});
