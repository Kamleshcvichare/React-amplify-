// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable from 'zen-observable-ts';
import { PubSubProvider, ProviderOptions } from '../types/Provider';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('AbstractPubSubProvider');

export abstract class AbstractPubSubProvider<T extends ProviderOptions>
	implements PubSubProvider
{
	private _config: T;

	constructor(options: T) {
		this._config = options;
	}

	configure(config: T): T {
		this._config = { ...config, ...this._config };

		logger.debug(`configure ${this.getProviderName()}`, this._config);

		return this.options;
	}

	getCategory() {
		return 'PubSub';
	}

	abstract getProviderName(): string;

	protected get options(): T {
		return { ...this._config };
	}

	public abstract newClient(clientOptions: T): Promise<any>;

	public abstract publish(
		topics: string[] | string,
		msg: Record<string, unknown> | string,
		options?: T
	): void;

	public abstract subscribe(
		topics: string[] | string,
		options?: T
	): Observable<Record<string, unknown>>;
}
