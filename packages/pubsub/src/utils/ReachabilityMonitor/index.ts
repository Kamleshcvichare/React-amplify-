// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Reachability } from '@aws-amplify/core';

export const ReachabilityMonitor = () => new Reachability().networkMonitor();
