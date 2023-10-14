// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { lexProvider } from '../../../src/lex-v2/AWSLexV2Provider';
import { onComplete } from '../../../src/lex-v2';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration.test';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

describe('Interactions LexV2 API: onComplete', () => {
	const v2BotConfig = generateRandomLexV2Config();

	const mockLexProvider = lexProvider.onComplete as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v2BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider onComplete API', () => {
		const message = uuid();
		const mockCallback = jest.fn();
		onComplete(v2BotConfig.name, mockCallback);
		expect(mockLexProvider).toBeCalledTimes(1);
		expect(mockLexProvider).toBeCalledWith(v2BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() => onComplete(v2BotConfig.name, jest.fn)).toThrow(
			InteractionsError
		);
	});
});
