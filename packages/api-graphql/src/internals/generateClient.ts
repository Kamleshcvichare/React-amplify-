// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import { graphql, cancel, isCancelError } from './v6';
import { generateModelsProperty } from './generateModelsProperty';
import { V6Client, __amplify } from '../types';
import { ClientGenerationParams } from './types';

/**
 * @private
 *
 * Creates a client that can be used to make GraphQL requests, using a provided `AmplifyClassV6`
 * compatible context object for config and auth fetching.
 *
 * @param params
 * @returns
 */
export function generateClient<T extends Record<any, any> = never>(
	params: ClientGenerationParams
): V6Client<T> {
	const client = {
		[__amplify]: params.amplify,
		graphql,
		cancel,
		isCancelError,
		models: {},
	} as any;

	client.models = generateModelsProperty<T>(client, params);

	return client as V6Client<T>;
}