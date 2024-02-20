// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ModelTypes, CustomQueries } from '@aws-amplify/data-schema-types';
import { graphQLOperationsInfo, ModelOperation } from './APIClient';
import { ClientGenerationParams } from './types';
import { V6Client, __authMode, __authToken } from '../types';

import { customOpFactory } from './operations/custom';
import { ModelIntrospectionSchema } from '@aws-amplify/core/internals/utils';

export function generateQueriesProperty<T extends Record<any, any> = never>(
	client: V6Client<Record<string, any>>,
	params: ClientGenerationParams
): CustomQueries<T> {
	const config = params.amplify.getConfig();

	if (!config.API?.GraphQL) {
		// breaks compatibility with certain bundler, e.g. Vite where component files are evaluated before
		// the entry point causing false positive errors. Revisit how to better handle this post-launch

		// throw new Error(
		// 	'The API configuration is missing. This is likely due to Amplify.configure() not being called
		// prior to generateClient().'
		// );
		return {} as CustomQueries<T>;
	}

	const modelIntrospection: ModelIntrospectionSchema | undefined =
		config.API.GraphQL.modelIntrospection;

	if (!modelIntrospection) {
		return {} as CustomQueries<T>;
	}

	const queries = {} as CustomQueries<T>;
	for (const queryOperation of Object.values(modelIntrospection.queries)) {
		queries[queryOperation.name as keyof CustomQueries<T>] = customOpFactory(
			client,
			modelIntrospection,
			'query',
			queryOperation
		);
	}

	// for (const query of Object.values(modelIntrospection.queries)) {
	// 	const { name } = query;
	// 	queries[name] = getFactory(client, modelIntrospection, query, operation);
	// }
	// return models;

	return queries;
}