const mockRestPost = jest.fn();
import {
	MutationProcessor,
	safeJitteredBackoff,
} from '../src/sync/processors/mutation';
import {
	Model as ModelType,
	PostCustomPK as PostCustomPKType,
	PostCustomPKSort as PostCustomPKSortType,
	testSchema,
	internalTestSchema,
} from './helpers';
import {
	PersistentModelConstructor,
	InternalSchema,
	OpType,
} from '../src/types';
import { createMutationInstanceFromModelOperation } from '../src/sync/utils';
import { MutationEvent } from '../src/sync/';
import { Constants } from '@aws-amplify/core';
import { USER_AGENT_SUFFIX_DATASTORE } from '../src/util';

let syncClasses: any;
let modelInstanceCreator: any;
let Model: PersistentModelConstructor<ModelType>;
let PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
let PostCustomPKSort: PersistentModelConstructor<PostCustomPKSortType>;
let axiosError;

beforeEach(() => {
	axiosError = timeoutError;
});

describe('Jittered backoff', () => {
	it('should progress exponentially until some limit', () => {
		const COUNT = 13;

		const backoffs = [...Array(COUNT)].map((v, i) =>
			safeJitteredBackoff(i)
		) as (number | boolean)[];

		const isExpectedValue = (value, attempt) => {
			const lowerLimit = 2 ** attempt * 100;
			const upperLimit = lowerLimit + 100;

			if (lowerLimit < 2 ** 12 * 100) {
				console.log(
					`attempt ${attempt} (${value}) should be between ${lowerLimit} and ${upperLimit} inclusively.`
				);
				return value >= lowerLimit && value <= upperLimit;
			} else {
				console.log(`attempt ${attempt} (${value}) should be false.`);
				return value === false;
			}
		};

		backoffs.forEach((value, attempt) => {
			expect(isExpectedValue(value, attempt)).toBe(true);
		});

		// we should be testing up to the edge. at least one backoff at the
		// end of the list must be false. (past the limit)
		expect(backoffs.pop()).toBe(false);
	});

	it('should retry forever on network errors', () => {
		const MAX_DELAY = 5 * 60 * 1000;
		const COUNT = 1000;

		const backoffs = [...Array(COUNT)].map((v, i) =>
			safeJitteredBackoff(i, [], new Error('Network Error'))
		) as (number | boolean)[];

		backoffs.forEach(v => {
			expect(v).toBeTruthy();
			expect(v).toBeLessThanOrEqual(MAX_DELAY);
		});
	});
});

describe('MutationProcessor', () => {
	let mutationProcessor: MutationProcessor;

	beforeEach(async () => {
		mutationProcessor = await instantiateMutationProcessor();
	});

	// Test for this PR: https://github.com/aws-amplify/amplify-js/pull/6542
	describe('100% Packet Loss Axios Error', () => {
		it('Should result in Network Error and get handled without breaking the Mutation Processor', async () => {
			const mutationProcessorSpy = jest.spyOn(mutationProcessor, 'resume');

			await mutationProcessor.resume();

			expect(mockRetry.mock.results).toHaveLength(1);

			await expect(mockRetry.mock.results[0].value).rejects.toEqual(
				new Error('Network Error')
			);

			expect(mutationProcessorSpy).toHaveBeenCalled();

			// MutationProcessor.resume exited successfully, i.e., did not throw
			await expect(mutationProcessorSpy.mock.results[0].value).resolves.toEqual(
				undefined
			);
		});
	});
	describe('createQueryVariables', () => {
		it('Should correctly generate delete mutation input for models with a custom PK', async () => {
			// custom PK @key(fields: ["postId"])
			const deletePost = new PostCustomPK({
				postId: '100',
				title: 'Title',
				dateCreated: new Date().toISOString(),
			});

			const { data } = await createMutationEvent(deletePost, OpType.DELETE);

			const [, { input }] = (mutationProcessor as any).createQueryVariables(
				'user',
				'PostCustomPK',
				'Delete',
				data,
				'{}'
			);

			expect(input.postId).toEqual('100');
			expect(input.id).toBeUndefined();
		});

		it('Should correctly generate delete mutation input for models with a custom PK - multi-field', async () => {
			// multi-key PK @key(fields: ["id", "postId"])
			const deletePost = new PostCustomPKSort({
				id: 'abcdef',
				postId: '100',
				title: 'Title',
			});

			const { data } = await createMutationEvent(deletePost, OpType.DELETE);

			const [, { input }] = (mutationProcessor as any).createQueryVariables(
				'user',
				'PostCustomPKSort',
				'Delete',
				data,
				'{}'
			);

			expect(input.id).toEqual('abcdef');
			expect(input.postId).toEqual('100');
		});
	});
	describe('Call to rest api', () => {
		it('Should send a user agent with the datastore suffix the rest api request', async () => {
			jest.spyOn(mutationProcessor, 'resume');
			await mutationProcessor.resume();

			expect(mockRestPost).toBeCalledWith(
				expect.anything(),
				expect.objectContaining({
					headers: expect.objectContaining({
						'x-amz-user-agent': `${Constants.userAgent}${USER_AGENT_SUFFIX_DATASTORE}`,
					}),
				})
			);
		});
	});
	describe('Call to rest api', () => {
		it('Should send a user agent with the datastore suffix the rest api request', async () => {
			jest.spyOn(mutationProcessor, 'resume');
			await mutationProcessor.resume();

			expect(mockRestPost).toBeCalledWith(
				expect.anything(),
				expect.objectContaining({
					headers: expect.objectContaining({
						'x-amz-user-agent': `${Constants.userAgent}${USER_AGENT_SUFFIX_DATASTORE}`,
					}),
				})
			);
		});
	});

	it('unauthorized hub event', async () => {
		jest.spyOn(mutationProcessor, 'resume');

		mockRetry.mockImplementationOnce(() =>
			Promise.reject({ message: 'Request failed with status code 401' })
		);

		await mutationProcessor.resume();
		expect(hubDispatchMock).toBeCalledWith('datastore', {
			event: 'mutationError',
			data: {
				errorType: 'Unauthorized',
				authModes: ['API_KEY'],
				errors: [{ message: 'Request failed with status code 401' }],
				model: Model.name,
			},
		});
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});
});

describe('error handler', () => {
	let mutationProcessor: MutationProcessor;
	const errorHandler = jest.fn();

	beforeEach(async () => {
		errorHandler.mockClear();
		mutationProcessor = await instantiateMutationProcessor({ errorHandler });
	});

	test('newly required field', async () => {
		axiosError = {
			message: "Variable 'name' has coerced Null value for NonNull type",
			name: 'Error',
			code: '',
			errorType: '',
		};
		await mutationProcessor.resume();
		expect(errorHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				operation: 'Create',
				process: 'mutate',
				errorType: 'BadRecord',
			})
		);
	});

	test('connection timout', async () => {
		axiosError = {
			message: 'Connection failed: Connection Timeout',
			name: 'Error',
			code: '',
			errorType: '',
		};
		await mutationProcessor.resume();
		expect(errorHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				operation: 'Create',
				process: 'mutate',
				errorType: 'Transient',
			})
		);
	});

	test('server error', async () => {
		axiosError = {
			message: 'Error: Request failed with status code 500',
			name: 'Error',
			code: '',
			errorType: '',
		};
		await mutationProcessor.resume();
		expect(errorHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				operation: 'Create',
				process: 'mutate',
				errorType: 'Transient',
			})
		);
	});

	test('no auth decorator', async () => {
		axiosError = {
			message: 'Request failed with status code 401',
			name: 'Error',
			code: '',
			errorType: '',
		};
		await mutationProcessor.resume();
		expect(errorHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				operation: 'Create',
				process: 'mutate',
				errorType: 'Unauthorized',
			})
		);
	});
});
// Mocking restClient.post to throw the error we expect
// when experiencing poor network conditions
jest.mock('@aws-amplify/api-rest', () => {
	return {
		...jest.requireActual('@aws-amplify/api-rest'),
		RestClient() {
			return {
				post: mockRestPost.mockImplementation(() => {
					return Promise.reject(axiosError);
				}),
				getCancellableToken: () => {},
				updateRequestToBeCancellable: () => {},
				isCancel: () => false,
			};
		},
	};
});

// Configuring the API category so that API.graphql can be used
// by the MutationProcessor
jest.mock('@aws-amplify/api', () => {
	const awsconfig = {
		aws_project_region: 'us-west-2',
		aws_appsync_graphqlEndpoint:
			'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
		aws_appsync_region: 'us-west-2',
		aws_appsync_authenticationType: 'API_KEY',
		aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxx',
	};

	const { GraphQLAPIClass } = jest.requireActual('@aws-amplify/api-graphql');
	const graphqlInstance = new GraphQLAPIClass(null);
	graphqlInstance.configure(awsconfig);

	const actualAPIModule = jest.requireActual('@aws-amplify/api');
	const actualAPIInstance = actualAPIModule.API;

	return {
		...actualAPIModule,
		API: {
			...actualAPIInstance,
			graphql: graphqlInstance.graphql.bind(graphqlInstance),
		},
	};
});

// mocking jitteredBackoff to prevent it from retrying
// endlessly in the mutation processor and so that we can expect the thrown result in our test
// should throw a Network Error
let mockRetry;
let hubDispatchMock;
jest.mock('@aws-amplify/core', () => {
	mockRetry = jest.fn().mockImplementation(async (fn, args) => {
		await fn(...args);
	});
	hubDispatchMock = jest.fn();
	return {
		...jest.requireActual('@aws-amplify/core'),
		retry: mockRetry,
		Hub: {
			dispatch: hubDispatchMock,
			listen: jest.fn(),
		},
	};
});

// Mocking just enough dependencies for us to be able to
// instantiate a working MutationProcessor
// includes functional mocked outbox containing a single MutationEvent
async function instantiateMutationProcessor({
	errorHandler = () => null,
} = {}) {
	let schema: InternalSchema = internalTestSchema();

	jest.doMock('../src/sync/', () => ({
		SyncEngine: {
			getNamespace: () => schema.namespaces['sync'],
		},
	}));

	const { initSchema, DataStore } = require('../src/datastore/datastore');
	const classes = initSchema(testSchema());

	({ Model, PostCustomPK, PostCustomPKSort } = classes as {
		Model: PersistentModelConstructor<ModelType>;
		PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
		PostCustomPKSort: PersistentModelConstructor<PostCustomPKSortType>;
	});

	const userClasses = {};
	userClasses['Model'] = Model;
	userClasses['PostCustomPK'] = PostCustomPK;
	userClasses['PostCustomPKSort'] = PostCustomPKSort;

	await DataStore.start();
	({ syncClasses } = require('../src/datastore/datastore'));
	({ modelInstanceCreator, schema } = (DataStore as any).storage.storage);

	const newModel = new Model({
		field1: 'Some value',
		dateCreated: new Date().toISOString(),
	});

	const newMutationEvent = createMutationEvent(newModel, OpType.INSERT);
	// mocking mutation queue with a single event
	const mutationQueue = [newMutationEvent];

	const outbox = {
		peek: () => {
			return mutationQueue[0];
		},
		dequeue: () => {
			mutationQueue.pop();
		},
	};

	const storage = {
		runExclusive: fn => fn(),
	};

	const mutationProcessor = new MutationProcessor(
		schema,
		storage as any,
		userClasses,
		outbox as any,
		modelInstanceCreator,
		{} as any,
		{
			aws_project_region: 'us-west-2',
			aws_appsync_graphqlEndpoint:
				'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
			aws_appsync_region: 'us-west-2',
			aws_appsync_authenticationType: 'API_KEY',
			aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxx',
		},
		() => null,
		errorHandler,
		() => null as any,
		{} as any
	);

	(mutationProcessor as any).observer = true;

	return mutationProcessor;
}

// Creates MutationEvent instance that can be added to the outbox
async function createMutationEvent(model, opType): Promise<MutationEvent> {
	const MutationEventConstructor = syncClasses[
		'MutationEvent'
	] as PersistentModelConstructor<MutationEvent>;

	const modelConstructor = (Object.getPrototypeOf(model) as Object)
		.constructor as PersistentModelConstructor<any>;

	return createMutationInstanceFromModelOperation(
		undefined!,
		undefined!,
		opType,
		modelConstructor,
		model,
		{},
		MutationEventConstructor,
		modelInstanceCreator
	);
}

// expected error when experiencing 100% packet loss
const timeoutError = {
	message: 'timeout of 0ms exceeded',
	name: 'Error',
	stack:
		'Error: timeout of 0ms exceeded\n    at createError (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:265622:17)\n    at EventTarget.handleTimeout (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:265537:16)\n    at EventTarget.dispatchEvent (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:32460:27)\n    at EventTarget.setReadyState (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:31623:20)\n    at EventTarget.__didCompleteResponse (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:31443:16)\n    at http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:31553:47\n    at RCTDeviceEventEmitter.emit (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:7202:37)\n    at MessageQueue.__callFunction (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:2813:31)\n    at http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:2545:17\n    at MessageQueue.__guard (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:2767:13)',
	config: {
		url: 'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
		method: 'post',
		data: '{"query":"mutation operation($input: UpdatePostInput!, $condition: ModelPostConditionInput) {  updatePost(input: $input, condition: $condition) {    id    title    rating    status    _version    _lastChangedAt    _deleted    blog {      id      _deleted    }  }}","variables":{"input":{"id":"86e8f2c1-b002-4ff2-92a2-3dad37933477","status":"INACTIVE","_version":1},"condition":null}}',
		headers: {
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json; charset=UTF-8',
			'User-Agent': 'aws-amplify/3.8.21 react-native',
			'X-Api-Key': 'da2-xxxxxxxxxxxxxxxxxxxxxx',
			'x-amz-user-agent': 'aws-amplify/3.8.21 react-native',
		},
		transformRequest: [null],
		transformResponse: [null],
		timeout: 0,
		responseType: 'json',
		xsrfCookieName: 'XSRF-TOKEN',
		xsrfHeaderName: 'X-XSRF-TOKEN',
		maxContentLength: -1,
		maxBodyLength: -1,
		cancelToken: {
			promise: {
				_U: 1,
				_V: 0,
				_W: null,
				_X: {
					onRejected: null,
					promise: {
						_U: 0,
						_V: 0,
						_W: null,
						_X: null,
					},
				},
			},
		},
		host: 'xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com',
		path: '/graphql',
		signerServiceInfo: {
			service: 'appsync',
			region: 'us-west-2',
		},
	},
	code: 'ECONNABORTED',
};
