// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger as Logger } from '@aws-amplify/core';
const logger = new Logger('urlListener');
import { Linking, AppState } from 'react-native';

let handler;

export default async callback => {
	if (handler) {
		return;
	}
	handler =
		handler ||
		(({ url, ...rest }: { url: string }) => {
			logger.debug('urlListener', { url, ...rest });
			callback({ url });
		});

	const linkingSubscription = Linking.addEventListener('url', handler);

	const appStateEventSubscription = AppState.addEventListener(
		'change',
		async newAppState => {
			if (newAppState === 'active') {
				const initialUrl = await Linking.getInitialURL();
				handler({ url: initialUrl });
			}
		}
	);
};
