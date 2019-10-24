import { Component, Prop, FunctionalComponent, h } from '@stencil/core';
import { PASSWORD_SUFFIX, PASSWORD_LABEL, PASSWORD_PLACEHOLDER } from '../../common/constants';

@Component({
  tag: 'amplify-password-field',
  shadow: false,
})
export class AmplifyPasswordField {
  /** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
  @Prop() fieldId: string = PASSWORD_SUFFIX;
  /** Used for the password label */
  @Prop() label: string = PASSWORD_LABEL;
  /** Used for the placeholder label */
  @Prop() placeholder: string = PASSWORD_PLACEHOLDER;
  /** Used as the hint in case you forgot your password, etc. */
  @Prop() hint: string | FunctionalComponent | null;
  /** The required flag in order to make an input required prior to submitting a form */
  @Prop() required: boolean = false;
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;
  /** The value of the content inside of the input field */
  @Prop() value?: string;
  /** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
  @Prop() inputProps?: object;

  render() {
    return (
      <amplify-form-field
        type="password"
        fieldId={this.fieldId}
        label={this.label}
        placeholder={this.placeholder}
        hint={this.hint}
        required={this.required}
        handleInputChange={this.handleInputChange}
        value={this.value}
        inputProps={this.inputProps}
      />
    );
  }
}
