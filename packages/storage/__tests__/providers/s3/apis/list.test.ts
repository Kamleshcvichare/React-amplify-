// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import { listObjectsV2 } from '../../../../src/providers/s3/utils/client';
import { list } from '../../../../src/providers/s3';
import {
	ListAllOptionsWithPrefix,
	ListPaginateOptionsWithPrefix,
} from '../../../../src/providers/s3/types';
import { StorageValidationErrorCode } from '../../../../src/errors/types/validation';

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
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;
const mockListObject = listObjectsV2 as jest.Mock;
const key = 'path/itemsKey';
const bucket = 'bucket';
const region = 'region';
const nextToken = 'nextToken';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';
const eTag = 'eTag';
const lastModified = 'lastModified';
const size = 'size';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const listObjectClientConfig = {
	credentials,
	region,
	userAgentValue: expect.any(String),
};
const listObjectClientBaseResultItem = {
	ETag: eTag,
	LastModified: lastModified,
	Size: size,
};
const listResultItem = {
	eTag,
	lastModified,
	size,
};
const mockListObjectsV2ApiWithPages = (pages: number) => {
	let methodCalls = 0;
	mockListObject.mockClear();
	mockListObject.mockImplementation(async (_, input) => {
		let token: string | undefined = undefined;
		methodCalls++;
		if (methodCalls > pages) {
			fail(`listObjectsV2 calls are more than expected. Expected ${pages}`);
		}
		if (input.ContinuationToken === undefined || methodCalls < pages) {
			token = nextToken;
		}
		return {
			Contents: [{ ...listObjectClientBaseResultItem, Key: input.Prefix }],
			NextContinuationToken: token,
		};
	});
};

describe('list API', () => {
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
	describe('Prefix: Happy Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		const accessLevelTests = [
			{
				expectedPath: `public/`,
			},
			{
				options: { accessLevel: 'guest' },
				expectedPath: `public/`,
			},
			{
				key,
				expectedPath: `public/${key}`,
			},
			{
				key,
				options: { accessLevel: 'guest' },
				expectedPath: `public/${key}`,
			},
			{
				key,
				options: { accessLevel: 'private' },
				expectedPath: `private/${defaultIdentityId}/${key}`,
			},
			{
				key,
				options: { accessLevel: 'protected' },
				expectedPath: `protected/${defaultIdentityId}/${key}`,
			},
			{
				key,
				options: { accessLevel: 'protected', targetIdentityId },
				expectedPath: `protected/${targetIdentityId}/${key}`,
			},
		];

		accessLevelTests.forEach(({ key, options, expectedPath }) => {
			const pathMsg = key ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with pagination, default pageSize, ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{ ...listObjectClientBaseResultItem, Key: expectedPath },
						],
						NextContinuationToken: nextToken,
					};
				});
				let response = await list({
					prefix: key,
					options: options as ListPaginateOptionsWithPrefix,
				});
				expect(response.items).toEqual([{ ...listResultItem, key: key ?? '' }]);
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: expectedPath,
				});
			});
		});

		accessLevelTests.forEach(({ key, options, expectedPath }) => {
			const pathMsg = key ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with pagination using pageSize, nextToken, ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{ ...listObjectClientBaseResultItem, Key: expectedPath },
						],
						NextContinuationToken: nextToken,
					};
				});
				const customPageSize = 5;
				const response = await list({
					prefix: key,
					options: {
						...(options as ListPaginateOptionsWithPrefix),
						pageSize: customPageSize,
						nextToken: nextToken,
					},
				});
				expect(response.items).toEqual([{ ...listResultItem, key: key ?? '' }]);
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					Prefix: expectedPath,
					ContinuationToken: nextToken,
					MaxKeys: customPageSize,
				});
			});
		});

		accessLevelTests.forEach(({ key, options, expectedPath }) => {
			const pathMsg = key ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with zero results with ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce(() => {
					return {};
				});
				let response = await list({
					prefix: key,
					options: options as ListPaginateOptionsWithPrefix,
				});
				expect(response.items).toEqual([]);

				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: expectedPath,
				});
			});
		});

		accessLevelTests.forEach(({ key, options, expectedPath }) => {
			const pathMsg = key ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list all objects having three pages with ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObjectsV2ApiWithPages(3);
				const result = await list({
					prefix: key,
					options: { ...options, listAll: true } as ListAllOptionsWithPrefix,
				});

				const listResult = { ...listResultItem, key: key ?? '' };
				expect(result.items).toEqual([listResult, listResult, listResult]);
				expect(result).not.toHaveProperty(nextToken);

				// listing three times for three pages
				expect(listObjectsV2).toHaveBeenCalledTimes(3);

				// first input recieves undefined as the Continuation Token
				expect(listObjectsV2).toHaveBeenNthCalledWith(
					1,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: expectedPath,
						MaxKeys: 1000,
						ContinuationToken: undefined,
					},
				);
				// last input recieves TEST_TOKEN as the Continuation Token
				expect(listObjectsV2).toHaveBeenNthCalledWith(
					3,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: expectedPath,
						MaxKeys: 1000,
						ContinuationToken: nextToken,
					},
				);
			});
		});
	});

	describe('Path: Happy Cases:', () => {
		const resolvePath = (path: string | Function) =>
			typeof path === 'string' ? path : path({ identityId: defaultIdentityId });
		afterEach(() => {
			jest.clearAllMocks();
			mockListObject.mockClear();
		});
		const pathAsFunctionAndStringTests = [
			{
				path: `public/${key}`,
			},
			{
				path: ({ identityId }: any) => `protected/${identityId}/${key}`,
			},
		];

		it.each(pathAsFunctionAndStringTests)(
			'should list objects with pagination, default pageSize, custom path',
			async ({ path }) => {
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: resolvePath(path),
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				let response = await list({
					path,
				});
				expect(response.items).toEqual([
					{ ...listResultItem, path: resolvePath(path) },
				]);
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: resolvePath(path),
				});
			},
		);

		it.each(pathAsFunctionAndStringTests)(
			'should list objects with pagination using custom pageSize, nextToken and custom path: ${path}',
			async ({ path }) => {
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: resolvePath(path),
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				const customPageSize = 5;
				const response = await list({
					path,
					options: {
						pageSize: customPageSize,
						nextToken: nextToken,
					},
				});
				expect(response.items).toEqual([
					{ ...listResultItem, path: resolvePath(path) ?? '' },
				]);
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					Prefix: resolvePath(path),
					ContinuationToken: nextToken,
					MaxKeys: customPageSize,
				});
			},
		);

		it.each(pathAsFunctionAndStringTests)(
			'should list objects with zero results with custom path: ${path}',
			async ({ path }) => {
				mockListObject.mockImplementationOnce(() => {
					return {};
				});
				let response = await list({
					path,
				});
				expect(response.items).toEqual([]);

				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: resolvePath(path),
				});
			},
		);

		it.each(pathAsFunctionAndStringTests)(
			'should list all objects having three pages with custom path: ${path}',
			async ({ path }) => {
				mockListObjectsV2ApiWithPages(3);
				const result = await list({
					path,
					options: { listAll: true },
				});

				const listResult = {
					...listResultItem,
					path: resolvePath(path),
				};
				expect(result.items).toEqual([listResult, listResult, listResult]);
				expect(result).not.toHaveProperty(nextToken);

				// listing three times for three pages
				expect(listObjectsV2).toHaveBeenCalledTimes(3);

				// first input recieves undefined as the Continuation Token
				expect(listObjectsV2).toHaveBeenNthCalledWith(
					1,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: resolvePath(path),
						MaxKeys: 1000,
						ContinuationToken: undefined,
					},
				);
				// last input recieves TEST_TOKEN as the Continuation Token
				expect(listObjectsV2).toHaveBeenNthCalledWith(
					3,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: resolvePath(path),
						MaxKeys: 1000,
						ContinuationToken: nextToken,
					},
				);
			},
		);
	});

	describe('Error Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('should return a not found error', async () => {
			mockListObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			try {
				await list({});
			} catch (error: any) {
				expect.assertions(3);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: 'public/',
				});
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
