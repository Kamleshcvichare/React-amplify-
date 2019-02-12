import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { SignInComponentCore } 
from '../../../components/authenticator/sign-in-component/sign-in.component.core';
import Amplify from 'aws-amplify';


describe('SignInComponentCore: ', () => {

  let component: SignInComponentCore;
  let fixtureComponent: SignInComponentCore;
  let service: AmplifyService;
  let fixture;
  let setAuthStateSpy;
  let signInSpy;
  let onSignInSpy;
  let onSignUpSpy;
  let onForgotPasswordSpy;

  const modules = {
    Auth: {
      signIn: () => {
        return new Promise((resolve, reject) => {
          resolve(1);
        });
      },
      currentAuthenticatedUser: () => {
        return new Promise((resolve, reject) => {
          resolve(1);
        });
      }
    }
  };

  beforeEach(() => { 
    service = new AmplifyService(modules);
    component = new SignInComponentCore(service);
    setAuthStateSpy = jest.spyOn(service, 'setAuthState');
    signInSpy = jest.spyOn(service.auth(), 'signIn');
    TestBed.configureTestingModule({
      declarations: [
        SignInComponentCore
      ],
      providers: [
        {
          provide: AmplifyService,
          useFactory: () => {
            return AmplifyModules({
              ...modules
            });
          }
        }
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SignInComponentCore);
    fixtureComponent = fixture.componentInstance;
    onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
    onSignUpSpy = jest.spyOn(fixtureComponent, 'onSignUp');
    onForgotPasswordSpy = jest.spyOn(fixtureComponent, 'onForgotPassword');
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onForgotPassword method', () => {
    expect(component.onForgotPassword).toBeTruthy();
  });

  it('...should call setAuthState within the onForgotPassword method', () => {
    component.username = 'test-username2';
    const callingAuthState = component.onForgotPassword();
    expect(service.setAuthState).toBeCalled();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should call signIn within the onSignUp method', () => {
    component.username = 'test-username3';
    component.password = 'test-password3';
    const callingAuthState = component.onSignIn();
    expect(signInSpy).toBeCalled();
  });

  it('...should have an onSignUp method', () => {
    expect(component.onSignUp).toBeTruthy();
  });

  it('...should call setAuthState within the onSignUp method', () => {
    component.username = 'test-username2';
    const callingAuthState = component.onSignUp();
    expect(service.setAuthState).toBeCalled();
  });

  it('...should have a setPassword method', () => {
    expect(component.setPassword).toBeTruthy();
  });

  it('...should set this.password with the setPassword method', () => {
    component.setPassword('my-test-password');
    expect(component.password).toEqual('my-test-password');
  });

  it('...should have a setUsername method', () => {
    expect(component.setUsername).toBeTruthy();
  });

  it('...should set this.username with the setUsername method', () => {
    component.setUsername('my-test-name');
    expect(component.username).toEqual('my-test-name');
  });

  it('...should not display if _show is not set', () => {
    const rootEl = fixture.debugElement.nativeElement.querySelector('.amplify-container');
    expect(rootEl).toBeFalsy();
  });

  it('...should display if _show is set', () => {
    fixtureComponent._show = true;
    fixture.detectChanges();
    const rootEl = fixture.debugElement.nativeElement.querySelector('.amplify-container');
    expect(rootEl).toBeTruthy();
  });

  it('...should call onSignIn when button is clicked', () => {
    fixtureComponent._show = true;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelector('.amplify-form-button');
    button.click();
    expect(onSignInSpy).toHaveBeenCalled();
    expect(signInSpy).toHaveBeenCalled();
  });

  it('...should call onSignUp when "No account?" element is clicked', () => {
    fixtureComponent._show = true;
    fixture.detectChanges();
    const parent = fixture.debugElement.nativeElement.querySelector('.amplify-form-signup');
    const a = parent.querySelector('.amplify-form-link');
    a.click();
    expect(onSignUpSpy).toHaveBeenCalled();
  });

  it('...should call onForgotPassword when "Forgot password?" element is clicked', () => {
    fixtureComponent._show = true;
    fixture.detectChanges();
    const parent = fixture.debugElement.nativeElement.querySelector('.amplify-form-action');
    const a = parent.querySelector('.amplify-form-link');
    a.click();
    expect(onForgotPasswordSpy).toHaveBeenCalled();
  });
});
