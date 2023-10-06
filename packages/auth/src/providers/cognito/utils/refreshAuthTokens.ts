// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoAuthTokens, TokenRefresher } from '../tokenProvider/types';
import { AuthConfig } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	decodeJWT,
} from '@aws-amplify/core/internals/utils';
import { initiateAuth } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokensWithRefreshToken } from '../utils/types';
import { AuthError } from '../../../errors/AuthError';

export const refreshAuthTokens: TokenRefresher = async ({
	tokens,
	authConfig,
}: {
	tokens: CognitoAuthTokens;
	authConfig?: AuthConfig;
}): Promise<CognitoAuthTokens> => {
	assertTokenProviderConfig(authConfig?.Cognito);
	const region = getRegion(authConfig.Cognito.userPoolId);
	assertAuthTokensWithRefreshToken(tokens);
	const refreshTokenString = tokens.refreshToken;

	const AuthParameters: Record<string, string> = {
		REFRESH_TOKEN: refreshTokenString,
	};
	if (tokens.deviceMetadata?.deviceKey) {
		AuthParameters['DEVICE_KEY'] = tokens.deviceMetadata.deviceKey;
	}
	const { AuthenticationResult } = await initiateAuth(
		{ region },
		{
			ClientId: authConfig?.Cognito?.userPoolClientId,
			AuthFlow: 'REFRESH_TOKEN_AUTH',
			AuthParameters,
		}
	);

	const accessToken = decodeJWT(AuthenticationResult?.AccessToken ?? '');
	const idToken = AuthenticationResult?.IdToken
		? decodeJWT(AuthenticationResult.IdToken)
		: undefined;
	const iat = accessToken.payload.iat;
	// This should never happen. If it does, it's a bug from the service.
	if (!iat) {
		throw new AuthError({
			name: 'iatNotFoundException',
			message: 'iat not found in access token',
		});
	}
	const clockDrift = iat * 1000 - new Date().getTime();
	const refreshToken = AuthenticationResult?.RefreshToken;

	return {
		accessToken,
		idToken,
		clockDrift,
		refreshToken,
		username: `${accessToken.payload.username}`,
	};
};
