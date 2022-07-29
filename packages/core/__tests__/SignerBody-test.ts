import Signer from '../src/Signer';
import { DateUtils } from '../src';

jest.mock('@aws-sdk/util-hex-encoding', () => ({
	...jest.requireActual('@aws-sdk/util-hex-encoding'),
	toHex: () => {
		return 'encrypt';
	},
}));

describe('Signer test', () => {
	test('Should throw an Error when body attribute is passed to sign method', () => {
		const url = 'https://host/some/path';

		const request_body = {
			url,
			headers: {},
			body: {},
		};

		const request_data = {
			url,
			headers: {},
			data: {},
		};

		const access_info = {
			session_token: 'session_token',
		};

		const spyon = jest
			.spyOn(Date.prototype, 'toISOString')
			.mockReturnValueOnce('0');

		const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');

		const res = {
			headers: {
				Authorization:
					'AWS4-HMAC-SHA256 Credential=undefined/0/aregion/aservice/aws4_request, 			SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=encrypt',
				'X-Amz-Security-Token': 'session_token',
				host: 'host',
				'x-amz-date': '0',
			},
			url: url,
			data: request_data.data,
		};

		expect(() => {
			Signer.sign(request_body, access_info, {
				service: 'aservice',
				region: 'aregion',
			});
		}).toThrowError(
			'The attribute "body" was found on the request object. Please use the attribute "data" instead.'
		);

		expect(getDateSpy).toHaveBeenCalledTimes(0);
		spyon.mockClear();
	});

	test('Should NOT throw an Error when data attribute is passed to sign method', () => {
		const url = 'https://host/some/path';

		const request_body = {
			url,
			headers: {},
			data: {},
		};

		const request_data = {
			url,
			headers: {},
			data: {},
		};

		const access_info = {
			session_token: 'session_token',
		};

		const spyon = jest
			.spyOn(Date.prototype, 'toISOString')
			.mockReturnValueOnce('0');

		const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');

		const res = {
			headers: {
				Authorization:
					'AWS4-HMAC-SHA256 Credential=undefined/0/aregion/aservice/aws4_request, 					SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=encrypt',
				'X-Amz-Security-Token': 'session_token',
				host: 'host',
				'x-amz-date': '0',
			},
			url: url,
			data: request_data.data,
		};

		expect(() => {
			Signer.sign(request_data, access_info, {
				service: 'aservice',
				region: 'aregion',
			});
		}).not.toThrowError();

		expect(getDateSpy).toHaveBeenCalledTimes(1);
		spyon.mockClear();
	});
});
