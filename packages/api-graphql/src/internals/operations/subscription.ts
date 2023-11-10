// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { map } from 'rxjs';
import { GraphqlSubscriptionResult } from '../../types';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	authModeParams,
	getAdditionalHeadersFromClient,
} from '../APIClient';

export function subscriptionFactory(
	client,
	modelIntrospection,
	model,
	operation
) {
	const { name } = model as any;

	const subscription = (args?: any) => {
		const query = generateGraphQLDocument(
			modelIntrospection.models,
			name,
			operation
		);
		const variables = buildGraphQLVariables(
			model,
			operation,
			args,
			modelIntrospection
		);

		const auth = authModeParams(client, args);

		const headers = getAdditionalHeadersFromClient(client);

		// TODO: client headers
		debugger;

		const observable = client.graphql(
			{
				...auth,
				query,
				variables,
			},
			headers
		) as GraphqlSubscriptionResult<object>;

		// TODO:
		// need to pass to `initializeModel`?
		debugger;

		return observable.pipe(
			map(value => {
				const [key] = Object.keys(value.data);
				const [initialized] = initializeModel(
					client,
					name,
					[value.data[key]],
					modelIntrospection,
					auth.authMode,
					auth.authToken
				);
				return initialized;
			})
		);
	};

	return subscription;
}