// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadUrlPolyfill } from '@aws-amplify/react-native';

loadUrlPolyfill();

// TODO: V6 replace Signer
export { signRequest } from './signRequest';
export { presignUrl } from './presignUrl';
export { TOKEN_QUERY_PARAM } from './constants';
export { getHashedPayload } from './utils/getHashedPayload';
