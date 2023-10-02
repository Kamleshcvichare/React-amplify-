// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';
import { AnalyticsServiceOptions } from '.';
import {
	SessionTrackingOpts,
	PageViewTrackingOpts,
	EventTrackingOpts,
} from './trackers';

/**
 * Input type for `identifyUser`.
 */
export type AnalyticsIdentifyUserInput<
	ServiceOptions extends AnalyticsServiceOptions = AnalyticsServiceOptions
> = {
	/**
	 * A User ID associated to the current device.
	 */
	userId: string;

	/**
	 * Additional information about the user and their device.
	 */
	userProfile: UserProfile;

	/**
	 * Options to be passed to the API.
	 */
	options?: {
		serviceOptions?: ServiceOptions;
	};
};

/**
 * Input type for `configureAutoTrack`.
 */
export type AnalyticsConfigureAutoTrackInput = {
	enable: boolean;
} & (SessionTrackingOpts | PageViewTrackingOpts | EventTrackingOpts);
