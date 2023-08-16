// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { VerifySoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { verifyTOTPSetup } from '../../../src/providers/cognito';
import * as verifySoftwareTokenClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { VerifySoftwareTokenCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { AmplifyV6 as Amplify } from 'aws-amplify';
import { decodeJWT } from '@aws-amplify/core';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
		identityPoolId: 'us-west-2:xxxxxx',
	},
});
const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('verifyTOTPSetup  API happy path cases', () => {
	let verifySoftwareTokenClientSpy;
	let fetchAuthSessionsSpy;
	const code = '123456';
	const friendlyDeviceName = 'FriendlyDeviceName';

	beforeEach(() => {
		fetchAuthSessionsSpy = jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
		verifySoftwareTokenClientSpy = jest
			.spyOn(verifySoftwareTokenClient, 'verifySoftwareToken')
			.mockImplementationOnce(async () => {
				return {} as VerifySoftwareTokenCommandOutput;
			});
	});

	afterEach(() => {
		verifySoftwareTokenClientSpy.mockClear();
		fetchAuthSessionsSpy.mockClear();
	});

	test('verifyTOTPSetup API should return successful response', async () => {
		await verifyTOTPSetup({
			code,
			options: { serviceOptions: { friendlyDeviceName } },
		});

		expect(verifySoftwareTokenClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				UserCode: code,
				FriendlyDeviceName: friendlyDeviceName,
			})
		);
	});
});

describe('verifyTOTPSetup  API error path cases:', () => {
	test('verifyTOTPSetup API should throw a validation AuthError when code is empty', async () => {
		expect.assertions(2);
		try {
			await verifyTOTPSetup({ code: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyVerifyTOTPSetupCode);
		}
	});

	test('verifyTOTPSetup API should raise an error when VerifySoftwareTokenClient throws an error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(
					VerifySoftwareTokenException.InvalidParameterException
				)
			)
		);
		jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
		try {
			const code = '123456';
			await verifyTOTPSetup({ code });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifySoftwareTokenException.InvalidParameterException
			);
		}
	});
});
