export default {
	middleware: {
		protector: {
			protectedRoutePatterns: [/^\/admin(\/.*$|$)/]
		},
		rateLimit: {},
		logger: {
			ignorePaths: [/^\/__access_denied__/]
		}
	},
	features: {}
};
