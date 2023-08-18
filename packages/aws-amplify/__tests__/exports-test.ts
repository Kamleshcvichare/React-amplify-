import * as exported from '../src';

describe('aws-amplify', () => {
	describe('import * keys', () => {
		it('should match snapshot', () => {
			expect(Object.keys(exported)).toMatchInlineSnapshot(`
			Array [
			  "Amplify",
			  "withSSRContext",
			  "Analytics",
			  "AWSPinpointProvider",
			  "Storage",
			  "StorageClass",
			  "Logger",
			  "Hub",
			  "ClientDevice",
			  "Signer",
			  "I18n",
			  "AmplifyV6",
			]
		`);
		});
	});
});
