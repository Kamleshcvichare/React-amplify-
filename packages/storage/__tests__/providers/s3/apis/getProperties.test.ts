// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../src/providers/s3/utils/client';
import { getProperties } from '../../../../src/providers/s3';
import { Credentials } from '@aws-sdk/types';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';

jest.mock('../../../../src/providers/s3/utils/client');
const mockHeadObject = headObject as jest.Mock;
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

jest.mock('@aws-amplify/core', () => ({
	fetchAuthSession: jest.fn(),
	Amplify: {
		getConfig: jest.fn(),
	},
}));

const bucket = 'bucket';
const region = 'region';
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';

describe('getProperties api', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: targetIdentityId,
		});
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
				},
			},
		});
		afterEach(() => {
			jest.clearAllMocks();
		});
	});
	describe('getProperties happy path ', () => {
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

		it('getProperties with guest accessLevel', async () => {
			expect.assertions(3);
			const metadata = { key: 'value' };
			expect(
				await getProperties({
					key: 'key',
					options: {
						accessLevel: 'guest',
					},
				})
			).toEqual({
				key: 'key',
				size: '100',
				contentType: 'text/plain',
				eTag: 'etag',
				metadata,
				lastModified: 'last-modified',
				versionId: 'version-id',
			});
			expect(headObject).toBeCalledTimes(1);
			expect(headObject).toHaveBeenCalledWith(
				{
					credentials,
					region: 'region',
				},
				{
					Bucket: 'bucket',
					Key: 'public/key',
				}
			);
		});

		it('getProperties with protected accessLevel', async () => {
			expect.assertions(3);
			const metadata = { key: 'value' };
			expect(
				await getProperties({
					key: 'key',
					options: {
						targetIdentityId: 'targetIdentityId',
						accessLevel: 'protected',
					},
				})
			).toEqual({
				key: 'key',
				size: '100',
				contentType: 'text/plain',
				eTag: 'etag',
				metadata,
				lastModified: 'last-modified',
				versionId: 'version-id',
			});
			expect(headObject).toBeCalledTimes(1);
			expect(headObject).toHaveBeenCalledWith(
				{
					credentials,
					region: 'region',
				},
				{
					Bucket: 'bucket',
					Key: 'protected/targetIdentityId/key',
				}
			);
		});

		it('getProperties with private accessLevel', async () => {
			expect.assertions(3);
			const metadata = { key: 'value' };
			expect(
				await getProperties({
					key: 'key',
					options: {
						targetIdentityId: 'targetIdentityId',
						accessLevel: 'protected',
					},
				})
			).toEqual({
				key: 'key',
				size: '100',
				contentType: 'text/plain',
				eTag: 'etag',
				metadata,
				lastModified: 'last-modified',
				versionId: 'version-id',
			});
			expect(headObject).toBeCalledTimes(1);
			expect(headObject).toHaveBeenCalledWith(
				{
					credentials,
					region: 'region',
				},
				{
					Bucket: 'bucket',
					Key: 'protected/targetIdentityId/key',
				}
			);
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
				})
			);
			try {
				await getProperties({ key: 'keyed' });
			} catch (error) {
				expect.assertions(3);
				expect(headObject).toBeCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(
					{
						credentials,
						region: 'region',
					},
					{
						Bucket: 'bucket',
						Key: 'public/keyed',
					}
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
