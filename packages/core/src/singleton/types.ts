// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIConfig, LibraryAPIOptions } from './API/types';
import { AnalyticsConfig } from './Analytics/types';
import {
	AuthConfig,
	LibraryAuthOptions,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
	CognitoIdentityPoolConfig,
} from './Auth/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';

export type ResourcesConfig = {
	API?: APIConfig;
	Analytics?: AnalyticsConfig;
	Auth?: AuthConfig;
	// Cache?: CacheConfig;
	// DataStore?: {};
	// I18n?: I18nOptions;
	// Interactions?: {};
	// Notifications?: {};
	// Predictions?: {};
	Storage?: StorageConfig;
	ssr?: boolean;
};

// Dynamic config
export type LibraryOptions = {
	API?: LibraryAPIOptions;
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
};

export {
	APIConfig,
	AuthConfig,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
	StorageAccessLevel,
	StorageConfig,
	AnalyticsConfig,
	CognitoIdentityPoolConfig,
};
