// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { record } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	AWSCredentials,
	ConsoleLogger,
} from '@aws-amplify/core/internals/utils';
import {
	OnPushNotificationMessageHandler,
	PushNotificationEvent,
	PushNotificationMessage,
} from '../../../types';
import { getAnalyticsEvent } from './getAnalyticsEvent';
import { getChannelType } from './getChannelType';
import { resolveCredentials } from './resolveCredentials';
import { resolveConfig } from './resolveConfig';

const logger = new ConsoleLogger('PushNotification.recordMessageEvent');

/**
 * @internal
 */
export const createMessageEventRecorder =
	(
		event: PushNotificationEvent,
		callback?: Function
	): OnPushNotificationMessageHandler =>
	async message => {
		const { credentials } = await resolveCredentials();
		const { appId, region } = resolveConfig();
		await recordMessageEvent({
			appId,
			credentials,
			event,
			message,
			region,
		});
		callback?.();
	};

const recordMessageEvent = async ({
	appId,
	credentials,
	event,
	message,
	region,
}: {
	appId: string;
	credentials: AWSCredentials;
	event: PushNotificationEvent;
	message: PushNotificationMessage;
	region: string;
}): Promise<void> => {
	const analyticsEvent = getAnalyticsEvent(message, event);
	if (!analyticsEvent) {
		logger.debug('A notification missing event information was not recorded');
		return;
	}
	return record({
		appId,
		category: 'PushNotification',
		channelType: getChannelType(),
		credentials,
		event: analyticsEvent,
		region,
	});
};
