// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIError } from './APIError';
import { APIValidationErrorCode, validationErrorMap } from './validation';

/**
 * @internal
 */
export function assertValidationError(
	assertion: boolean,
	name: APIValidationErrorCode
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new APIError({ name, message, recoverySuggestion });
	}
}
