export enum AuthState {
  SignUp = 'signup',
  SignOut = 'signout',
  SignIn = 'signin',
  Loading = 'loading',
  signedOut = 'signedout',
  SignedIn = 'signedin',
  SigningUp = 'signingup',
  ConfirmSignUp = 'confirmSignUp',
  confirmingSignUpCustomFlow = 'confirmsignupcustomflow',
  ConfirmSignIn = 'confirmSignIn',
  confirmingSignInCustomFlow = 'confirmingsignincustomflow',
  VerifyingAttributes = 'verifyingattributes',
  ForgotPassword = 'forgotpassword',
  ResetPassword = 'resettingpassword',
  SettingMFA = 'settingMFA',
  TOTPSetup = 'TOTPSetup',
  CustomConfirmSignIn = 'customConfirmSignIn',
  VerifyContact = 'verifycontact',
}

export interface User {
  username?: string;
}
