export const OAUTH_CONFIG = {
    google: {
        clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        scope: "openid email profile",
        redirectUri: "http://localhost:5173/auth/google/callback"
    },
    github: {
        clientId: "YOUR_GITHUB_CLIENT_ID",
        authUrl: "https://github.com/login/oauth/authorize",
        scope: "read:user user:email",
        redirectUri: "http://localhost:5173/auth/github/callback"
    },
    orcid: {
        clientId: "APP-YOUR_ORCID_CLIENT_ID",
        authUrl: "https://orcid.org/oauth/authorize",
        scope: "/read-limited",
        redirectUri: "http://localhost:5173/auth/orcid/callback"
    }
};
