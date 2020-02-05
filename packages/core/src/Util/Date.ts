/**
 * Date & time utility functions to abstract the `aws-sdk` away from users.
 * (v2 => v3 modularization is a breaking change)
 *
 * @see https://github.com/aws/aws-sdk-js/blob/6edf586dcc1de7fe8fbfbbd9a0d2b1847921e6e1/lib/util.js#L262
 */

const DateUtils = {
	clockOffset: 0,

	getDateWithClockOffset() {
		if (DateUtils.clockOffset) {
			return new Date(new Date().getTime() + DateUtils.clockOffset);
		} else {
			return new Date();
		}
	},

	getClockOffset() {
		return DateUtils.clockOffset;
	},

	setClockOffset(offset: null | number) {
		DateUtils.clockOffset = offset;
	},
};

export { DateUtils as Date };
