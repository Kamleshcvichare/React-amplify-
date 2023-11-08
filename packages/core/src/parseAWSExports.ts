// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger } from './Logger';
import {
	OAuthConfig,
	AuthConfigUserAttributes,
	OAuthProvider,
} from './singleton/Auth/types';
import { ResourcesConfig } from './singleton/types';

const logger = new ConsoleLogger('parseAWSExports');

const authTypeMapping: Record<any, any> = {
	API_KEY: 'apiKey',
	AWS_IAM: 'iam',
	AMAZON_COGNITO_USER_POOLS: 'userPool',
	OPENID_CONNECT: 'oidc',
	NONE: 'none',
	LAMBDA: 'lambda',
};

/**
 * This utility converts the `aws-exports.js` file generated by the Amplify CLI into a {@link ResourcesConfig} object
 * consumable by Amplify.
 *
 * @param config A configuration object from `aws-exports.js`.
 *
 * @returns A {@link ResourcesConfig} object.
 */

export const parseAWSExports = (
	config: Record<string, any> = {}
): ResourcesConfig => {
	const {
		aws_appsync_apiKey,
		aws_appsync_authenticationType,
		aws_appsync_graphqlEndpoint,
		aws_appsync_region,
		aws_bots,
		aws_bots_config,
		aws_cognito_identity_pool_id,
		aws_cognito_sign_up_verification_method,
		aws_cognito_mfa_configuration,
		aws_cognito_mfa_types,
		aws_cognito_password_protection_settings,
		aws_cognito_verification_mechanisms,
		aws_cognito_signup_attributes,
		aws_cognito_social_providers,
		aws_cognito_username_attributes,
		aws_mandatory_sign_in,
		aws_mobile_analytics_app_id,
		aws_mobile_analytics_app_region,
		aws_user_files_s3_bucket,
		aws_user_files_s3_bucket_region,
		aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing,
		aws_user_pools_id,
		aws_user_pools_web_client_id,
		geo,
		oauth,
		predictions,
		aws_cloud_logic_custom,
		Notifications,
	} = config;
	const amplifyConfig: ResourcesConfig = {};

	// Analytics
	if (aws_mobile_analytics_app_id) {
		amplifyConfig.Analytics = {
			Pinpoint: {
				appId: aws_mobile_analytics_app_id,
				region: aws_mobile_analytics_app_region,
			},
		};
	}

	// Notifications
	const { InAppMessaging, Push } = Notifications ?? {};
	if (InAppMessaging?.AWSPinpoint || Push?.AWSPinpoint) {
		amplifyConfig.Notifications = {};
		if (InAppMessaging?.AWSPinpoint) {
			const { appId, region } = InAppMessaging.AWSPinpoint;
			amplifyConfig.Notifications.InAppMessaging = {
				Pinpoint: {
					appId,
					region,
				},
			};
		}
		if (Push?.AWSPinpoint) {
			const { appId, region } = Push.AWSPinpoint;
			amplifyConfig.Notifications.PushNotification = {
				Pinpoint: {
					appId,
					region,
				},
			};
		}
	}

	// Interactions
	if (Array.isArray(aws_bots_config)) {
		amplifyConfig.Interactions = {
			LexV1: Object.fromEntries(aws_bots_config.map(bot => [bot.name, bot])),
		};
	}

	// API
	if (aws_appsync_graphqlEndpoint) {
		const defaultAuthMode = authTypeMapping[aws_appsync_authenticationType];
		if (!defaultAuthMode) {
			logger.debug(
				`Invalid authentication type ${aws_appsync_authenticationType}. Falling back to IAM.`
			);
		}
		amplifyConfig.API = {
			GraphQL: {
				endpoint: aws_appsync_graphqlEndpoint,
				apiKey: aws_appsync_apiKey,
				region: aws_appsync_region,
				defaultAuthMode: defaultAuthMode ?? 'iam',
			},
		};
	}

	// Auth
	const mfaConfig = aws_cognito_mfa_configuration
		? {
				status:
					aws_cognito_mfa_configuration &&
					aws_cognito_mfa_configuration.toLowerCase(),
				totpEnabled: aws_cognito_mfa_types?.includes('TOTP') ?? false,
				smsEnabled: aws_cognito_mfa_types?.includes('SMS') ?? false,
		  }
		: undefined;
	const passwordFormatConfig = aws_cognito_password_protection_settings
		? {
				minLength:
					aws_cognito_password_protection_settings.passwordPolicyMinLength,
				requireLowercase:
					aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes(
						'REQUIRES_LOWERCASE'
					) ?? false,
				requireUppercase:
					aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes(
						'REQUIRES_UPPERCASE'
					) ?? false,
				requireNumbers:
					aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes(
						'REQUIRES_NUMBERS'
					) ?? false,
				requireSpecialCharacters:
					aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes(
						'REQUIRES_SYMBOLS'
					) ?? false,
		  }
		: undefined;
	const mergedUserAttributes = Array.from(
		new Set([
			...(aws_cognito_verification_mechanisms ?? []),
			...(aws_cognito_signup_attributes ?? []),
		])
	);
	const userAttributesConfig = mergedUserAttributes.map((s: string) => ({
		[s.toLowerCase()]: {
			required: true, // All user attributes generated by the CLI will be required
		},
	})) as unknown as AuthConfigUserAttributes;
	const loginWithEmailEnabled =
		aws_cognito_username_attributes?.includes('EMAIL') ?? false;
	const loginWithPhoneEnabled =
		aws_cognito_username_attributes?.includes('PHONE_NUMBER') ?? false;
	if (aws_cognito_identity_pool_id || aws_user_pools_id) {
		amplifyConfig.Auth = {
			Cognito: {
				identityPoolId: aws_cognito_identity_pool_id,
				allowGuestAccess: aws_mandatory_sign_in !== 'enable',
				signUpVerificationMethod: aws_cognito_sign_up_verification_method,
				userAttributes: userAttributesConfig,
				userPoolClientId: aws_user_pools_web_client_id,
				userPoolId: aws_user_pools_id,
				mfa: mfaConfig,
				passwordFormat: passwordFormatConfig,
				loginWith: {
					username:
						loginWithEmailEnabled || loginWithPhoneEnabled ? false : true,
					email: loginWithEmailEnabled,
					phone: loginWithPhoneEnabled,
				},
			},
		};
	}

	const hasOAuthConfig = oauth ? Object.keys(oauth).length > 0 : false;
	const hasSocialProviderConfig = aws_cognito_social_providers
		? aws_cognito_social_providers.length > 0
		: false;
	if (amplifyConfig.Auth && hasOAuthConfig) {
		amplifyConfig.Auth.Cognito.loginWith = {
			...amplifyConfig.Auth.Cognito.loginWith,
			oauth: {
				...getOAuthConfig(oauth),
				...(hasSocialProviderConfig && {
					providers: parseSocialProviders(aws_cognito_social_providers),
				}),
			},
		};
	}

	// Storage
	if (aws_user_files_s3_bucket) {
		amplifyConfig.Storage = {
			S3: {
				bucket: aws_user_files_s3_bucket,
				region: aws_user_files_s3_bucket_region,
				dangerouslyConnectToHttpEndpointForTesting:
					aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing,
			},
		};
	}

	// Geo
	if (geo) {
		const { amazon_location_service } = geo;
		(amplifyConfig as any).Geo = amazon_location_service
			? {
					LocationService: {
						...amazon_location_service,
						searchIndices: amazon_location_service.search_indices,
						region: amazon_location_service.region,
					},
			  }
			: { ...geo };
	}

	// REST API
	if (aws_cloud_logic_custom) {
		amplifyConfig.API = {
			...amplifyConfig.API,
			REST: (aws_cloud_logic_custom as any[]).reduce(
				(acc, api: Record<string, any>) => {
					const { name, endpoint, region, service } = api;
					return {
						...acc,
						[name]: {
							endpoint,
							...(service ? { service } : undefined),
							...(region ? { region } : undefined),
						},
					};
				},
				{}
			),
		};
	}

	// Predictions
	if (predictions) {
		// map VoiceId from speechGenerator defaults to voiceId
		const { VoiceId: voiceId } =
			predictions?.convert?.speechGenerator?.defaults ?? {};
		amplifyConfig.Predictions = voiceId
			? {
					...predictions,
					convert: {
						...predictions.convert,
						speechGenerator: {
							...predictions.convert.speechGenerator,
							defaults: { voiceId },
						},
					},
			  }
			: predictions;
	}

	return amplifyConfig;
};

const getRedirectUrl = (redirectStr: string): string[] =>
	redirectStr?.split(',') ?? [];

const getOAuthConfig = ({
	domain,
	scope,
	redirectSignIn,
	redirectSignOut,
	responseType,
}: Record<string, any>): OAuthConfig => ({
	domain,
	scopes: scope,
	redirectSignIn: getRedirectUrl(redirectSignIn),
	redirectSignOut: getRedirectUrl(redirectSignOut),
	responseType,
});

const parseSocialProviders = (aws_cognito_social_providers: string[]) => {
	return aws_cognito_social_providers.map((provider: string) => {
		const updatedProvider = provider.toLowerCase();
		return updatedProvider.charAt(0).toUpperCase() + updatedProvider.slice(1);
	}) as OAuthProvider[];
};
