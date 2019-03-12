import * as React from 'react';
import { Component } from 'react';

import { JS, I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import {
    FormSection,
    SectionBody,
    Strike,
} from '../Amplify-UI/Amplify-UI-Components-React';

import {
    GoogleButton,
    FacebookButton,
    AmazonButton,
    OAuthButton,
    Auth0Button
} from './Provider';

const logger = new Logger('FederatedSignIn');

export interface IFederatedButtonsProps {
    authState: any;
    federated: any;
    onAuthEvent?: any;
    onStateChange: any;
    theme: any;
}

export class FederatedButtons extends Component<IFederatedButtonsProps, {}> {
    google(google_client_id: any) {
        if (!google_client_id) { return null; }

        const { theme, onStateChange } = this.props;
        return <GoogleButton
                google_client_id={google_client_id}
                theme={theme}
                onStateChange={onStateChange}
              />;
    }

    facebook(facebook_app_id: any) {
        if (!facebook_app_id) { return null; }

        const { theme, onStateChange } = this.props;
        return <FacebookButton
                facebook_app_id={facebook_app_id}
                theme={theme}
                onStateChange={onStateChange}
                />;
    }

    amazon(amazon_client_id: any) {
        if (!amazon_client_id) { return null; }

        const { theme, onStateChange } = this.props;
        return <AmazonButton
                amazon_client_id={amazon_client_id}
                theme={theme}
                onStateChange={onStateChange}
              />;
    }

    OAuth(oauth_config: any) {
        if (!oauth_config) { return null;}
        const { theme, onStateChange } = this.props;
        return <OAuthButton
                label={oauth_config? oauth_config.label : undefined}
                theme={theme}
                onStateChange={onStateChange}
              />;
    }

    auth0(auth0: any) {
        if (!auth0) { return null;}
        const { theme, onStateChange } = this.props;
        return <Auth0Button
                label={auth0? auth0.label : undefined}
                theme={theme}
                onStateChange={onStateChange}
                auth0={auth0}
              />;
    }

    render() {
        const { authState } = this.props;
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }

        const federated = this.props.federated || {};
        if (!Auth || typeof Auth.configure !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }

        // @ts-ignore
        const { oauth={} } = Auth.configure();
        // backward compatibility
        if (oauth['domain']) {
            federated.oauth_config = Object.assign({}, federated.oauth_config, oauth);
        } else if (oauth.awsCognito) {
            federated.oauth_config = Object.assign({}, federated.oauth_config, oauth.awsCognito);
        }

        if (oauth.auth0) {
            federated.auth0 = Object.assign({}, federated.auth0, oauth.auth0);
        }

        if (JS.isEmpty(federated)) { return null; }

        const { google_client_id, facebook_app_id, amazon_client_id, oauth_config, auth0 } = federated;

        const theme = this.props.theme || AmplifyTheme;
        return (
            <div>
                <div>
                {this.google(google_client_id)}
                </div>
                <div>
                {this.facebook(facebook_app_id)}
                </div>
                <div>
                {this.amazon(amazon_client_id)}
                </div>
                <div>
                {this.OAuth(oauth_config)}
                </div>
                <div>
                {this.auth0(auth0)}
                </div>
                <Strike theme={theme}>{I18n.get('or')}</Strike>
            </div>
        );
    }
}

export default class FederatedSignIn extends Component<any, any> {
    render() {
        const { authState, onStateChange } = this.props;
        const federated = this.props.federated || {};
        if (!Auth || typeof Auth.configure !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        
        // @ts-ignore
        const { oauth={} } = Auth.configure();
        // backward compatibility
        if (oauth['domain']) {
            federated.oauth_config = Object.assign({}, federated.oauth_config, oauth);
        } else if (oauth.awsCognito) {
            federated.oauth_config = Object.assign({}, federated.oauth_config, oauth.awsCognito);
        }

        if (oauth.auth0) {
            federated.auth0 = Object.assign({}, federated.auth0, oauth.auth0);
        }

        if (!federated) {
            logger.debug('federated prop is empty. show nothing');
            logger.debug('federated={google_client_id: , facebook_app_id: , amazon_client_id}');
            return null;
        }
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }
        logger.debug('federated Config is', federated);
        const theme = this.props.theme || AmplifyTheme;
        return (
            <FormSection theme={theme}>
                <SectionBody theme={theme}>
                    <FederatedButtons
                        federated={federated}
                        theme={theme}
                        authState={authState}
                        onStateChange={onStateChange}
                    />
                </SectionBody>
            </FormSection>
        );
    }
}
