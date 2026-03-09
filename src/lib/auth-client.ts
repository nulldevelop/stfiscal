import {
  organizationClient,
  usernameClient
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
	if (process.env.BETTER_AUTH_URL) {
		return process.env.BETTER_AUTH_URL;
	}
	if (process.env.LINK_URL) {
		return `https://${process.env.LINK_URL}`;
	}
};

export const authClient = createAuthClient({
	baseURL: getBaseUrl(),
	plugins: [usernameClient(), organizationClient()],
});
