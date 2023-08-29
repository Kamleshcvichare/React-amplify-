// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Entry point for Node.js-specific S3 client utilities
// This behavior is not guaranteed in v5.
export {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
	CANCELED_ERROR_MESSAGE,
	CONTENT_SHA256_HEADER,
} from './constants';
export { s3TransferHandler } from './s3TransferHandler/fetch';
export { parser } from './xmlParser/pureJs';
// TODO[AllanZhengYP]: support isCancelError in Node.js with node-fetch
export { isCancelError } from './xhrTransferHandler';
export { toBase64, utf8Encode } from './index.native';

// Make sure package.json is included in the TypeScript build output.
// This is necessary for bundlers to pick up the correct implementation for given platform(web/node).
import './package.json';
