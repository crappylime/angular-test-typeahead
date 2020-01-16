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

    it('waits 300 ms after the last typed character', fakeAsync(() => {
      spyOn(service, 'searchWords').and.returnValue(of(['tech talk']));
      const inputTextArray = ['t', 'te', 'tec'];
      const textMock$: Observable<string> = interval(100).pipe(
        take(3),
        map(index => inputTextArray[index])
      );

      textMock$.subscribe(char => {
        htmlInput.value = char;
        htmlInput.dispatchEvent(new Event('input'));
      });
      tick(600);
      fixture.detectChanges();

      expect(service.searchWords).toHaveBeenCalledTimes(1);
    }));

    it('waits 2 ms after the last typed character', () => {
      expect(component).toBeTruthy();
    });

    it('displays an alert when no matches were found', () => {
      expect(component).toBeTruthy();
    });
  });
});
