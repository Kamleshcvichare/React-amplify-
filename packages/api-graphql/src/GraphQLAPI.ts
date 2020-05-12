/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { GraphQLError } from 'graphql/error/GraphQLError';
// @ts-ignore
import { OperationDefinitionNode } from 'graphql/language';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import Observable from 'zen-observable-ts';
import Amplify, {
	ConsoleLogger as Logger,
	Credentials,
	Constants,
	INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
} from '@aws-amplify/core';
import PubSub from '@aws-amplify/pubsub';
import Auth from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';
import { GraphQLOptions, GraphQLResult } from './types';
import { RestClient } from '@aws-amplify/api-rest';
const USER_AGENT_HEADER = 'x-amz-user-agent';

const logger = new Logger('GraphQLAPI');

export const graphqlOperation = (query, variables = {}) => ({
	query,
	variables,
});

/**
 * Export Cloud Logic APIs
 */
export class GraphQLAPIClass {
	/**
	 * @private
	 */
	private _options;
	private _api = null;

	/**
	 * Initialize GraphQL API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		Amplify.register(this);
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'GraphQLAPI';
	}

	/**
	 * Configure API
	 * @param {Object} config - Configuration of the API
	 * @return {Object} - The current configuration
	 */
	configure(options) {
		const { API = {}, ...otherOptions } = options || {};
		let opt = { ...otherOptions, ...API };
		logger.debug('configure GraphQL API', { opt });

		if (opt['aws_project_region']) {
			opt = Object.assign({}, opt, {
				region: opt['aws_project_region'],
				header: {},
			});
		}

		if (
			typeof opt.graphql_headers !== 'undefined' &&
			typeof opt.graphql_headers !== 'function'
		) {
			logger.warn('graphql_headers should be a function');
			opt.graphql_headers = undefined;
		}

		this._options = Object.assign({}, this._options, opt);

		this.createInstance();

		return this._options;
	}

	/**
	 * Create an instance of API for the library
	 * @return - A promise of true if Success
	 */
	createInstance() {
		logger.debug('create Rest instance');
		if (this._options) {
			this._api = new RestClient(this._options);
			return true;
		} else {
			return Promise.reject('API not configured');
		}
	}

	private async _headerBasedAuth(defaultAuthenticationType?) {
		const {
			aws_appsync_authenticationType,
			aws_appsync_apiKey: apiKey,
		} = this._options;
		const authenticationType =
			defaultAuthenticationType || aws_appsync_authenticationType || 'AWS_IAM';
		let headers = {};

		switch (authenticationType) {
			case 'API_KEY':
				if (!apiKey) {
					throw new Error('No api-key configured');
				}
				headers = {
					Authorization: null,
					'X-Api-Key': apiKey,
				};
				break;
			case 'AWS_IAM':
				const credentialsOK = await this._ensureCredentials();
				if (!credentialsOK) {
					throw new Error('No credentials');
				}
				break;
			case 'OPENID_CONNECT':
				const federatedInfo = await Cache.getItem('federatedInfo');

				if (!federatedInfo || !federatedInfo.token) {
					throw new Error('No federated jwt');
				}
				headers = {
					Authorization: federatedInfo.token,
				};
				break;
			case 'AMAZON_COGNITO_USER_POOLS':
				const session = await Auth.currentSession();
				headers = {
					Authorization: session.getAccessToken().getJwtToken(),
				};
				break;
			default:
				headers = {
					Authorization: null,
				};
				break;
		}

		return headers;
	}

	/**
	 * to get the operation type
	 * @param operation
	 */
	getGraphqlOperationType(operation) {
		const doc = parse(operation);
		const {
			definitions: [{ operation: operationType }],
		} = doc;

		return operationType;
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param {GraphQLOptions} GraphQL Options
	 * @param {object} additionalHeaders headers to merge in after any `graphql_headers` set in the config
	 * @returns {Promise<GraphQLResult> | Observable<object>}
	 */
	graphql(
		{ query: paramQuery, variables = {}, authMode }: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	) {
		const query =
			typeof paramQuery === 'string'
				? parse(paramQuery)
				: parse(print(paramQuery));

		const [operationDef = {}] = query.definitions.filter(
			def => def.kind === 'OperationDefinition'
		);
		const {
			operation: operationType,
		} = operationDef as OperationDefinitionNode;

		switch (operationType) {
			case 'query':
			case 'mutation':
				return this._graphql({ query, variables, authMode }, additionalHeaders);
			case 'subscription':
				return this._graphqlSubscribe(
					{ query, variables, authMode },
					additionalHeaders
				);
		}

		throw new Error(`invalid operation type: ${operationType}`);
	}

	private async _graphql(
		{ query, variables, authMode }: GraphQLOptions,
		additionalHeaders = {}
	): Promise<GraphQLResult> {
		if (!this._api) {
			await this.createInstance();
		}

		const {
			aws_appsync_region: region,
			aws_appsync_graphqlEndpoint: appSyncGraphqlEndpoint,
			graphql_headers = () => ({}),
			graphql_endpoint: customGraphqlEndpoint,
			graphql_endpoint_iam_region: customEndpointRegion,
		} = this._options;

		const headers = {
			...(!customGraphqlEndpoint && (await this._headerBasedAuth(authMode))),
			...(customGraphqlEndpoint &&
				(customEndpointRegion
					? await this._headerBasedAuth(authMode)
					: { Authorization: null })),
			...(await graphql_headers({ query, variables })),
			...additionalHeaders,
			...(!customGraphqlEndpoint && {
				[USER_AGENT_HEADER]: Constants.userAgent,
			}),
		};

		const body = {
			query: print(query),
			variables,
		};

		const init = {
			headers,
			body,
			signerServiceInfo: {
				service: !customGraphqlEndpoint ? 'appsync' : 'execute-api',
				region: !customGraphqlEndpoint ? region : customEndpointRegion,
			},
		};

		const endpoint = customGraphqlEndpoint || appSyncGraphqlEndpoint;

		if (!endpoint) {
			const error = new GraphQLError('No graphql endpoint provided.');

			throw {
				data: {},
				errors: [error],
			};
		}

		let response;
		try {
			response = await this._api.post(endpoint, init);
		} catch (err) {
			response = {
				data: {},
				errors: [new GraphQLError(err.message)],
			};
		}

		const { errors } = response;

		if (errors && errors.length) {
			throw response;
		}

		return response;
	}

	private _graphqlSubscribe(
		{ query, variables, authMode: defaultAuthenticationType }: GraphQLOptions,
		additionalHeaders = {}
	): Observable<any> {
		const {
			aws_appsync_region: region,
			aws_appsync_graphqlEndpoint: appSyncGraphqlEndpoint,
			aws_appsync_authenticationType,
			aws_appsync_apiKey: apiKey,
			graphql_headers = () => ({}),
		} = this._options;
		const authenticationType =
			defaultAuthenticationType || aws_appsync_authenticationType || 'AWS_IAM';

		if (PubSub && typeof PubSub.subscribe === 'function') {
			return PubSub.subscribe('', {
				provider: INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
				appSyncGraphqlEndpoint,
				authenticationType,
				apiKey,
				query: print(query),
				region,
				variables,
				graphql_headers,
				additionalHeaders,
			});
		} else {
			logger.debug('No pubsub module applied for subscription');
			throw new Error('No pubsub module applied for subscription');
		}
	}

	/**
	 * @private
	 */
	_ensureCredentials() {
		return Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for api', cred);

				return true;
			})
			.catch(err => {
				logger.warn('ensure credentials error', err);
				return false;
			});
	}
}

export const GraphQLAPI = new GraphQLAPIClass(null);
