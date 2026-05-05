# Keycloak Test Server: Google Workspace Integration

This document explains how to use Google Workspace accounts to sign in to the local Keycloak server defined in `docker-compose.yml`.

The current local setup runs:

- Keycloak `26.6.1`
- Admin console at `http://localhost:8080`
- Development mode with the default realm path format used by modern Keycloak:
  `http://localhost:8080/realms/<realm-name>/...`

## What This Integration Does

This setup makes Keycloak act as an identity broker:

1. A user opens your application.
2. The application redirects the user to Keycloak.
3. Keycloak redirects the user to Google.
4. The user authenticates with a Google Workspace account.
5. Google sends the user back to Keycloak.
6. Keycloak creates or links the user and then returns control to your application.

This is the simplest way to integrate Google Workspace for a test server.

## Prerequisites

- A running Keycloak container from this repository
- Access to a Google Cloud project
- Access to a Google Workspace tenant
- Permission to create OAuth credentials in Google Cloud
- Permission to configure app access in the Google Admin console if your org restricts third-party OAuth apps

## 1. Start Keycloak

From this repository:

```bash
docker compose up -d
```

Open:

- Keycloak: `http://localhost:8080`
- Admin console: `http://localhost:8080/admin`

Default admin credentials from the current compose file:

- Username: `admin`
- Password: `admin`

## 2. Create a Realm for Testing

In the Keycloak admin console:

1. Create a new realm, for example `workspace-test`.
2. Create or reuse the client application that will send users to Keycloak.

You can configure Google later per realm, so keep the final realm name stable before creating Google OAuth credentials.

## 3. Add Google as an Identity Provider in Keycloak

In the target realm:

1. Go to `Identity Providers`.
2. From `Add provider`, select `Google`.
3. Copy the `Redirect URI` shown by Keycloak.

For a realm named `workspace-test`, the redirect URI will typically be:

```text
http://localhost:8080/realms/workspace-test/broker/google/endpoint
```

Important:

- The redirect URI must match exactly in Google Cloud.
- Modern Keycloak does not use the old `/auth` prefix unless you explicitly configure `http-relative-path`.

## 4. Configure Google Cloud OAuth

In Google Cloud Console:

1. Open or create a project.
2. Go to `Google Auth Platform` or `APIs & Services`, depending on the console view.
3. Configure the OAuth consent screen.
4. Create an OAuth client.

Recommended settings for a Workspace-only test:

- App type: `Web application`
- User type: `Internal` if the app is only for users in your Google Workspace organization
- Authorized redirect URI: paste the Keycloak redirect URI exactly

For local testing, Google allows localhost redirect URIs for web server flows, so `http://localhost:8080/...` is valid.

After creation, copy:

- `Client ID`
- `Client Secret`

## 5. Complete the Keycloak Google Provider Configuration

Back in Keycloak, for the `Google` identity provider:

1. Paste the Google `Client ID`.
2. Paste the Google `Client Secret`.
3. Save the provider.

Recommended provider settings:

- `Enabled`: On
- `Store Tokens`: On if you expect to inspect or reuse Google tokens later
- `Trust Email`: On if you want Keycloak to trust Google as the source of email verification

For a basic login integration, the default scope used by Keycloak is usually sufficient.

## 6. Restrict Access to Google Workspace Users

If your goal is "only users from my Google Workspace can log in", use one of these controls:

### Option A: Use an Internal Google OAuth app

If your Google Cloud project belongs to your Workspace organization, set the OAuth app audience to `Internal`.

This is the cleanest option for an organization-only test deployment.

### Option B: Restrict in Keycloak by Email Domain

If you need more control, add a validation step in Keycloak so only users with your Workspace domain are accepted, for example:

- allow `@example.com`
- reject other Gmail or Google accounts

You can enforce this with realm-specific authentication flow logic, identity provider mappers, or custom validation if needed.

## 7. Configure the Login Experience

After Google is configured, users can sign in through the Keycloak login page.

Optional improvements:

- Set Google as the default identity provider in the browser flow if you want automatic redirect to Google
- Use `kc_idp_hint=google` from your application if you want to skip the provider selection screen for specific login routes

## 8. Test the Flow

Use this sequence:

1. Open your application or a Keycloak account/client login page.
2. Choose `Google` on the Keycloak login page.
3. Sign in with a Google Workspace account.
4. Confirm the user is created in the realm under `Users`.

If you want to test directly against the account console, you can also open:

```text
http://localhost:8080/realms/workspace-test/account
```

Keycloak should redirect unauthenticated users to login.

## 9. Common Problems

### `redirect_uri_mismatch`

Cause:

- The redirect URI in Google Cloud does not exactly match the Keycloak provider redirect URI.

Fix:

- Copy the redirect URI directly from the Keycloak Google provider page.
- Check scheme, host, port, path, and trailing slash.

### Google login works, but non-Workspace accounts can still try to sign in

Cause:

- The OAuth app is configured as `External`, or Keycloak is not validating the email domain.

Fix:

- Prefer an `Internal` app for Workspace-only testing.
- Add Keycloak-side restrictions if external accounts must be blocked.

### Login fails after changing the realm name

Cause:

- The redirect URI changed when the realm name changed.

Fix:

- Update the authorized redirect URI in Google Cloud to the new realm path.

### Login fails after enabling HTTPS or changing hostnames

Cause:

- Google validates redirect URIs exactly.

Fix:

- Re-register the new redirect URI in Google Cloud.
- For non-local environments, use HTTPS.

## 10. Suggested Test Values

Example values for this repository:

- Realm: `workspace-test`
- Keycloak URL: `http://localhost:8080`
- Redirect URI:

```text
http://localhost:8080/realms/workspace-test/broker/google/endpoint
```

## 11. Next Hardening Steps

For a real environment, do not keep the current dev defaults:

- change admin credentials
- stop using `start-dev`
- put Keycloak behind HTTPS
- use a stable hostname instead of `localhost`
- review whether token storage is required
- restrict access to approved Workspace users or groups

## References

- Keycloak Server Administration Guide: identity brokering and Google identity provider
  https://www.keycloak.org/docs/latest/server_admin/
- Google OpenID Connect documentation
  https://developers.google.com/identity/openid-connect/openid-connect
- Google OAuth 2.0 for web server applications
  https://developers.google.com/identity/protocols/oauth2/web-server
- Google Workspace OAuth consent configuration
  https://developers.google.com/workspace/guides/configure-oauth-consent
- Google Workspace app access control
  https://support.google.com/a/answer/13152743
