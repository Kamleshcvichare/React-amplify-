// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInputKey,
	StorageCopyInputPath,
	StorageDownloadDataInputKey,
	StorageDownloadDataInputPath,
	StorageGetPropertiesInputKey,
	StorageGetPropertiesInputPath,
	StorageListInputPath,
	StorageListInputPrefix,
	StorageRemoveInputKey,
	StorageRemoveInputPath,
	StorageUploadDataInputKey,
	StorageUploadDataInputPath,
} from '../../../types';
import {
	CopyDestinationOptionsKey,
	CopySourceOptionsKey,
	DownloadDataOptionsKey,
	DownloadDataOptionsPath,
	GetPropertiesOptionsKey,
	GetPropertiesOptionsPath,
	GetUrlOptionsKey,
	GetUrlOptionsPath,
	ListAllOptionsPath,
	ListAllOptionsPrefix,
	ListPaginateOptionsPath,
	ListPaginateOptionsPrefix,
	RemoveOptions,
	UploadDataOptionsKey,
	UploadDataOptionsPath,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */
export type CopyInput = CopyInputKey | CopyInputPath;

/** @deprecated Use {@link CopyInputPath} instead. */
export type CopyInputKey = StorageCopyInputKey<
	CopySourceOptionsKey,
	CopyDestinationOptionsKey
>;
export type CopyInputPath = StorageCopyInputPath;

/**
 * Input type for S3 getProperties API.
 */
export type GetPropertiesInput = StrictUnion<
	GetPropertiesInputKey | GetPropertiesInputPath
>;

/** @deprecated Use {@link GetPropertiesInputPath} instead. */
export type GetPropertiesInputKey =
	StorageGetPropertiesInputKey<GetPropertiesOptionsKey>;
export type GetPropertiesInputPath =
	StorageGetPropertiesInputPath<GetPropertiesOptionsPath>;

/** @deprecated Use {@link GetUrlInputPath} instead. */
export interface GetUrlInputKey {
	/** @deprecated Use `path` instead. */
	key: string;
	options?: GetUrlOptionsKey;
}

export interface GetUrlInputPath {
	key?: never;
	path: string | (({ identityId }: { identityId?: string }) => string);
	options?: GetUrlOptionsPath;
}

/**
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = GetUrlInputKey | GetUrlInputPath;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StrictUnion<ListAllInputPath | ListAllInputPrefix>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput = StrictUnion<
	ListPaginateInputPath | ListPaginateInputPrefix
>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputPath = StorageListInputPath<ListAllOptionsPath>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputPath =
	StorageListInputPath<ListPaginateOptionsPath>;

/**
 * @deprecated Use {@link ListAllInputPath} instead.
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputPrefix = StorageListInputPrefix<ListAllOptionsPrefix>;

/**
 * @deprecated Use {@link ListPaginateInputPath} instead.
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputPrefix =
	StorageListInputPrefix<ListPaginateOptionsPrefix>;

/**
 * @deprecated Use {@link RemoveInputPath} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInputKey = StorageRemoveInputKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveInputPath = StorageRemoveInputPath<
	Omit<RemoveOptions, 'accessLevel'>
>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StrictUnion<RemoveInputKey | RemoveInputPath>;

/**
 * Input type for S3 downloadData API.
 */
export type DownloadDataInput = StrictUnion<
	DownloadDataInputKey | DownloadDataInputPath
>;
/** @deprecated Use {@link DownloadDataInputPath} instead. */
export type DownloadDataInputKey =
	StorageDownloadDataInputKey<DownloadDataOptionsKey>;
export type DownloadDataInputPath =
	StorageDownloadDataInputPath<DownloadDataOptionsPath>;

/**
 * Input type for S3 uploadData API.
 */
export type UploadDataInput = StrictUnion<
	UploadDataInputKey | UploadDataInputPath
>;

/** @deprecated Use {@link UploadDataInputPath} instead. */
export type UploadDataInputKey =
	StorageUploadDataInputKey<UploadDataOptionsKey>;
export type UploadDataInputPath =
	StorageUploadDataInputPath<UploadDataOptionsPath>;
