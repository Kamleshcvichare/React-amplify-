/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import * as React from 'react';
import { JS, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import TOTPSetupComp from '../Widget/TOTPSetupComp';

const logger = new Logger('TOTPSetup');

export default class TOTPSetup extends AuthPiece<IAuthPieceProps, IAuthPieceState> {
    constructor(props: IAuthPieceProps) {
        super(props);

        this._validAuthStates = ['TOTPSetup'];
        this.onTOTPEvent = this.onTOTPEvent.bind(this);
        this.checkContact = this.checkContact.bind(this);
    }

    checkContact(user: any) {
        if (!Auth || typeof Auth.verifiedContact !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        Auth.verifiedContact(user)
            .then(data => {
                if (!JS.isEmpty(data.verified)) {
                    this.changeState('signedIn', user);
                } else {
                    const newUser = Object.assign(user, data);
                    this.changeState('verifyContact', newUser);
                }
            });
    }

    onTOTPEvent(event: any, data: any, user: any) {
        logger.debug('on totp event', event, data);
        // const user = this.props.authData;
        if (event === 'Setup TOTP') {
            if (data === 'SUCCESS') {
                this.checkContact(user);
            }
        }
    }

    showComponent(theme: any) {
        const { authData, hide } = this.props;
        if (hide && hide.includes(TOTPSetup)) { return null; }

        return (
            <TOTPSetupComp authData={authData} theme={theme} onTOTPEvent={this.onTOTPEvent} />
        );
    }
}
