import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAnuncianteComponent } from './home-anunciante.component';

describe('HomeAnuncianteComponent', () => {
  let component: HomeAnuncianteComponent;
  let fixture: ComponentFixture<HomeAnuncianteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeAnuncianteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAnuncianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
