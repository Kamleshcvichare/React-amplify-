// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `@aws-amplify/core`. These are intended to be potentially customer-facing exports.
*/
// TODO Remove these
export { ClientDevice } from './ClientDevice';
export { ConsoleLogger, ConsoleLogger as Logger } from './Logger';
export { Hub } from './Hub';
export { HubCapsule, HubCallback, HubPayload } from './Hub/types';
export { FacebookOAuth, GoogleOAuth } from './OAuthHelper';
export { AppState, AsyncStorage, Linking } from './RNComponents';
export { Credentials, CredentialsClass } from './Credentials';
export { ICredentials } from './types';

// Singleton exports
export {
	TokenProvider,
	AuthTokens,
	FetchAuthSessionOptions,
	AWSCredentialsAndIdentityIdProvider,
	AWSCredentialsAndIdentityId,
	Identity,
	OAuthConfig,
} from './singleton/Auth/types';
export {
	AuthConfig,
	UserPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
	StorageAccessLevel,
	StorageConfig,
	GetCredentialsOptions,
	ResourcesConfig,
	LibraryOptions,
} from './singleton/types';
export {
	Amplify,
	fetchAuthSession,
	AmplifyClass as AmplifyClassV6,
	clearCredentials,
} from './singleton';

// AWSClients exports
export {
	getCredentialsForIdentity,
	getId,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from './AwsClients/CognitoIdentity';

// Amplify-wide constructs
export { UserProfile } from './types';

// Storage helpers
export {
	StorageHelper,
	MemoryStorage,
	LocalStorage,
	CookieStorage,
	SessionStorage,
	MemoryKeyValueStorage,
} from './StorageHelper';
export { KeyValueStorageInterface } from './types';
export { UniversalStorage } from './UniversalStorage';

// Cache exports
import { BrowserStorageCache } from './Cache/BrowserStorageCache';
export { InMemoryCache } from './Cache/InMemoryCache';
export { CacheConfig } from './Cache/types';
export { BrowserStorageCache };
export { BrowserStorageCache as Cache }; // Maintain interoperability with React Native

// Internationalization utilities
export { I18n } from './I18n';

export { parseAWSExports } from './parseAWSExports';
