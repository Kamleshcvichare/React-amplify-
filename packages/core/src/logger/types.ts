// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggerCategory } from '../types';

export type LogLevel = 'DEBUG' | 'ERROR' | 'INFO' | 'WARN' | 'VERBOSE' | 'NONE';

export interface LogParams {
	namespace: string;
	logLevel: LogLevel;
	message: string;
	category?: LoggerCategory;
}

export interface LoggerProvider {
	log: (logParams: LogParams) => void;
	flushLogs: () => Promise<void>;
	enable: () => void;
	disable: () => void;
}

export interface LoggerType {
	verbose: (message: string) => void;
	debug: (message: string) => void;
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
	log: (message: string, level?: LogLevel) => void;
}

export interface GenerateLoggerInput {
	namespace: string;
	category?: LoggerCategory;
}

export type GenerateLoggerOutput = LoggerType;
