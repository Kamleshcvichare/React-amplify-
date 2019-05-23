import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-sign-in',
})
export class AmplifySignIn {
  @Prop() handleSubmit: (Event) => void;
  @Prop() validationErrors: string;

  render() {
    return (
      <amplify-section>
        <amplify-section-header>Sign in to your account</amplify-section-header>
        <form onSubmit={this.handleSubmit}>
          <amplify-sign-in-username-field />
          <amplify-sign-in-password-field />
          {this.validationErrors && <p>{this.validationErrors}</p>}
          <amplify-button type="submit">Submit</amplify-button>
        </form>
      </amplify-section>
    );
  }
}
