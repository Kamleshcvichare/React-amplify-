// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInput,
	StorageDownloadDataInputKey,
	StorageDownloadDataInputPath,
	StorageGetPropertiesInput,
	StorageGetUrlInput,
	StorageListInputPath,
	StorageListInputPrefix,
	StorageRemoveInput,
	StorageUploadDataInput,
} from '../../../types';
import {
	CopyDestinationOptions,
	CopySourceOptions,
	DownloadDataOptionsKey,
	DownloadDataOptions as DownloadDataOptionsPath,
	GetPropertiesOptions,
	GetUrlOptions,
	ListAllOptionsPath,
	ListAllOptionsPrefix,
	ListPaginateOptionsPath,
	ListPaginateOptionsPrefix,
	RemoveOptions,
	UploadDataOptions,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */
export type CopyInput = StorageCopyInput<
	CopySourceOptions,
	CopyDestinationOptions
>;

/**
 * Input type for S3 getProperties API.
 */
export type GetPropertiesInput =
	StorageGetPropertiesInput<GetPropertiesOptions>;

/**
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = StorageGetUrlInput<GetUrlOptions>;

export type ListInput =
	| StorageListInputPath<ListAllOptionsPath | ListPaginateOptionsPath>
	| StorageListInputPrefix<ListAllOptionsPrefix | ListPaginateOptionsPrefix>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StorageRemoveInput<RemoveOptions>;

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
export type UploadDataInput = StorageUploadDataInput<UploadDataOptions>;
