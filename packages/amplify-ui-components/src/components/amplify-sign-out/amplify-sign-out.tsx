import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, Prop, h } from '@stencil/core';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { dispatchToastHubEvent, dispatchAuthStateChangeEvent } from '../../common/helpers';
import { AuthMessages } from '../../common/types/AuthMessages';

@Component({
  tag: 'amplify-sign-out',
  shadow: true,
})
export class AmplifySignOut {
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** Text inside of the Sign Out button */
  @Prop() buttonText: string = I18n.get(AuthMessages.SIGN_OUT);

  async signOut(event) {
    if (event) event.preventDefault();

    // TODO: Federated Sign Out

    if (!Auth || typeof Auth.signOut !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      await Auth.signOut();
      this.handleAuthStateChange(AuthState.SignedOut);
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  render() {
    return (
      <amplify-button
        overrideStyle={this.overrideStyle}
        onClick={event => this.signOut(event)}
        data-test="sign-out-button"
      >
        {this.buttonText}
      </amplify-button>
    );
  }
}
