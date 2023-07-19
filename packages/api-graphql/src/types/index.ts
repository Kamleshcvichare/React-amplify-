// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Source, DocumentNode, GraphQLError } from 'graphql';
export { OperationTypeNode } from 'graphql';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/auth';
export { GRAPHQL_AUTH_MODE };
import { Observable } from 'zen-observable-ts';

/**
 * Loose/Unknown options for raw GraphQLAPICategory `graphql()`.
 */
export interface GraphQLOptions {
	query: string | DocumentNode;
	variables?: object;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	/**
	 * @deprecated This property should not be used
	 */
	userAgentSuffix?: string; // TODO: remove in v6
}

export interface GraphQLResult<T = object> {
	data?: T;
	errors?: GraphQLError[];
	extensions?: {
		[key: string]: any;
	};
}

/**
 * The return value from a `graphql({query})` call when `query` is a subscription.
 *
 * ```ts
 * //               |-- You are here
 * //               v
 * const subResult: GraphqlSubscriptionResult<T> = client.graphql({
 * 	query: onCreateWidget
 * });
 *
 * const sub = subResult.subscribe({
 * 	//
 * 	//            |-- You are here
 * 	//            v
 * 	next(message: GraphqlSubscriptionMessage<OnCreateWidgetSubscription>) {
 * 		handle(message.value);  // <-- type OnCreateWidgetSubscription
 * 	}
 * })
 * ```
 */
export type GraphqlSubscriptionResult<T> = Observable<
	GraphqlSubscriptionMessage<T>
>;

/**
 * The shape of messages passed to `next()` from a graphql subscription. E.g.,
 *
 * ```ts
 * const sub = client.graphql({
 * 	query: onCreateWidget,
 * }).subscribe({
 * 	//
 * 	//            |-- You are here
 * 	//            v
 * 	next(message: GraphqlSubscriptionMessage<OnCreateWidgetSubscription>) {
 * 		handle(message.value);  // <-- type OnCreateWidgetSubscription
 * 	}
 * })
 * ```
 */
export type GraphqlSubscriptionMessage<T> = {
	provider: any;
	value: { data: T };
};

export enum GraphQLAuthError {
	NO_API_KEY = 'No api-key configured',
	NO_CURRENT_USER = 'No current user',
	NO_CREDENTIALS = 'No credentials',
	NO_FEDERATED_JWT = 'No federated jwt',
	NO_AUTH_TOKEN = 'No auth token specified',
}

/**
 * GraphQLSource or string, the type of the parameter for calling graphql.parse
 * @see: https://graphql.org/graphql-js/language/#parse
 */
export type GraphQLOperation = Source | string;

/**
 * API V6 `graphql({options})` type that can leverage branded graphql `query`
 * objects and fallback types.
 */
export interface GraphQLOptionsV6<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
> {
	query: TYPED_GQL_STRING | DocumentNode;
	variables?: GraphQLVariablesV6<FALLBACK_TYPES, TYPED_GQL_STRING>;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	/**
	 * @deprecated This property should not be used
	 */
	userAgentSuffix?: string; // TODO: remove in v6
}

/**
 * Result type for `graphql()` operations that don't include any specific
 * type information. The result could be either a `Promise` or `Subscription`.
 *
 * Invoking code should either cast the result or use `?` and `!` operators to
 * navigate the result objects.
 */
export type UnknownGraphQLResponse =
	| Promise<GraphQLResult<any>>
	| GraphqlSubscriptionResult<any>;

/**
 * The expected type for `variables` in a V6 `graphql()` operation with
 * respect to the given `FALLBACK_TYPES` and `TYPED_GQL_STRING`.
 */
export type GraphQLVariablesV6<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
> = TYPED_GQL_STRING extends GeneratedQuery<infer IN, any>
	? IN
	: TYPED_GQL_STRING extends GeneratedMutation<infer IN, any>
	? IN
	: TYPED_GQL_STRING extends GeneratedSubscription<infer IN, any>
	? IN
	: FALLBACK_TYPES extends GraphQLOperationType<infer IN, any>
	? IN
	: any;

/**
 * The expected return type with respect to the given `FALLBACK_TYPE`
 * and `TYPED_GQL_STRING`.
 */
export type GraphQLResponseV6<
	FALLBACK_TYPE = UnknownGraphQLResponse,
	TYPED_GQL_STRING extends string = string
> = TYPED_GQL_STRING extends GeneratedQuery<any, infer QUERY_OUT>
	? Promise<GraphQLResult<QUERY_OUT>>
	: TYPED_GQL_STRING extends GeneratedMutation<any, infer MUTATION_OUT>
	? Promise<GraphQLResult<MUTATION_OUT>>
	: TYPED_GQL_STRING extends GeneratedSubscription<any, infer SUB_OUT>
	? GraphqlSubscriptionResult<SUB_OUT>
	: FALLBACK_TYPE extends GraphQLOperationType<any, infer CUSTOM_OUT>
	? CUSTOM_OUT
	: FALLBACK_TYPE extends {}
	? FALLBACK_TYPE
	: UnknownGraphQLResponse;

/**
 * The shape customers can use to provide `T` to `graphql<T>()` to specify both
 * `IN` and `OUT` types (the type of `variables` and the return type, respectively).
 *
 * I.E.,
 *
 * ```ts
 * type MyVariablesType = { ... };
 * type MyResultType = { ... };
 * type MyOperationType = { variables: MyVariablesType, result: MyResultType };
 *
 * const result: MyResultType = graphql<MyOperationType>("graphql string", {
 * 	variables: {
 * 		// MyVariablesType
 * 	}
 * })
 * ```
 */
export type GraphQLOperationType<IN extends {}, OUT extends {}> = {
	variables: IN;
	result: OUT;
};

/**
 * Nominal type for branding generated graphql query operation strings with
 * input and output types.
 *
 * E.g.,
 *
 * ```ts
 * export const getWidget = `...` as GeneratedQuery<
 * 	GetWidgetQueryVariables,
 * 	GetWidgetQuery
 * >;
 * ```
 *
 * This allows `graphql()` to extract `InputType` and `OutputType` to correctly
 * assign types to the `variables` and result objects.
 */
export type GeneratedQuery<InputType, OutputType> = string & {
	__generatedQueryInput: InputType;
	__generatedQueryOutput: OutputType;
};

/**
 * Nominal type for branding generated graphql mutation operation strings with
 * input and output types.
 *
 * E.g.,
 *
 * ```ts
 * export const createWidget = `...` as GeneratedQuery<
 * 	CreateWidgetMutationVariables,
 * 	CreateWidgetMutation
 * >;
 * ```
 *
 * This allows `graphql()` to extract `InputType` and `OutputType` to correctly
 * assign types to the `variables` and result objects.
 */
export type GeneratedMutation<InputType, OutputType> = string & {
	__generatedMutationInput: InputType;
	__generatedMutationOutput: OutputType;
};

/**
 * Nominal type for branding generated graphql mutation operation strings with
 * input and output types.
 *
 * E.g.,
 *
 * ```ts
 * export const createWidget = `...` as GeneratedMutation<
 * 	CreateWidgetMutationVariables,
 * 	CreateWidgetMutation
 * >;
 * ```
 *
 * This allows `graphql()` to extract `InputType` and `OutputType` to correctly
 * assign types to the `variables` and result objects.
 */
export type GeneratedSubscription<InputType, OutputType> = string & {
	__generatedSubscriptionInput: InputType;
	__generatedSubscriptionOutput: OutputType;
};
