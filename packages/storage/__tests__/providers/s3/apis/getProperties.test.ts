// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../src/providers/s3/utils/client';
import { getProperties } from '../../../../src/providers/s3';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import {
	GetPropertiesOptionsKey,
	GetPropertiesOptionsPath,
} from '../../../../src/providers/s3/types';

jest.mock('../../../../src/providers/s3/utils/client');
jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn().mockImplementation(function ConsoleLogger() {
		return { debug: jest.fn() };
	}),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));
const mockHeadObject = headObject as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

const bucket = 'bucket';
const region = 'region';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const key = 'key';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';

describe('getProperties with key', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: defaultIdentityId,
		});
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
				},
			},
		});
	});
	describe('getProperties happy path with key', () => {
		const expected = {
			key,
			size: '100',
			contentType: 'text/plain',
			eTag: 'etag',
			metadata: { key: 'value' },
			lastModified: 'last-modified',
			versionId: 'version-id',
		};
		const config = {
			credentials,
			region: 'region',
			userAgentValue: expect.any(String),
		};
		beforeEach(() => {
			mockHeadObject.mockReturnValueOnce({
				ContentLength: '100',
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: 'last-modified',
				Metadata: { key: 'value' },
				VersionId: 'version-id',
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
		});
		[
			{
				expectedKey: `public/${key}`,
			},
			{
				options: { accessLevel: 'guest' },
				expectedKey: `public/${key}`,
			},
			{
				options: { accessLevel: 'private' },
				expectedKey: `private/${defaultIdentityId}/${key}`,
			},
			{
				options: { accessLevel: 'protected' },
				expectedKey: `protected/${defaultIdentityId}/${key}`,
			},
			{
				options: { accessLevel: 'protected', targetIdentityId },
				expectedKey: `protected/${targetIdentityId}/${key}`,
			},
		].forEach(({ options, expectedKey }) => {
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `and targetIdentityId`
				: '';
			it(`should getProperties with ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				const headObjectOptions = {
					Bucket: 'bucket',
					Key: expectedKey,
				};
				expect.assertions(3);
				expect(
					await getProperties({
						key,
						options: options as GetPropertiesOptionsKey,
					}),
				).toEqual(expected);
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
			});
		});
	});

	describe('getProperties error path', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('getProperties should return a not found error', async () => {
			mockHeadObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			expect.assertions(3);
			try {
				await getProperties({ key });
			} catch (error: any) {
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(
					{
						credentials,
						region: 'region',
						userAgentValue: expect.any(String),
					},
					{
						Bucket: 'bucket',
						Key: `public/${key}`,
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});

describe('getProperties with path', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: defaultIdentityId,
		});
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
				},
			},
		});
	});
	describe('getProperties with path', () => {
		const expected = {
			path: 'path',
			size: '100',
			contentType: 'text/plain',
			eTag: 'etag',
			metadata: { key: 'value' },
			lastModified: 'last-modified',
			versionId: 'version-id',
		};
		const config = {
			credentials,
			region: 'region',
			useAccelerateEndpoint: true,
			userAgentValue: expect.any(String),
		};
		beforeEach(() => {
			mockHeadObject.mockReturnValueOnce({
				ContentLength: '100',
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: 'last-modified',
				Metadata: { key: 'value' },
				VersionId: 'version-id',
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
		});
		[
			{
				path: 'path',
				expectedKey: 'path',
			},
			{
				path: () => 'path',
				expectedKey: 'path',
			},
		].forEach(({ path, expectedKey }) => {
			it(`should getProperties with path ${path} and expectedKey ${expectedKey}`, async () => {
				const headObjectOptions = {
					Bucket: 'bucket',
					Key: expectedKey,
				};
				expect.assertions(3);
				expect(
					await getProperties({
						path,
						options: {
							useAccelerateEndpoint: true,
						} as GetPropertiesOptionsPath,
					}),
				).toEqual(expected);
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
			});
		});
	});

	describe('getProperties error path with path', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('getProperties should return a not found error', async () => {
			mockHeadObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			expect.assertions(3);
			try {
				await getProperties({ path: 'path' });
			} catch (error: any) {
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(
					{
						credentials,
						region: 'region',
						userAgentValue: expect.any(String),
					},
					{
						Bucket: 'bucket',
						Key: 'path',
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
