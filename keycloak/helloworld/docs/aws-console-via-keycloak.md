# AWS Console Login via Keycloak with Google Workspace

This document explains how to let Google Workspace users sign in to the AWS Management Console through Keycloak.

It builds on the Google Workspace broker setup documented in `docs/google-workspace-integration.md`.

## Target Flow

The login chain is:

1. User opens an AWS login entrypoint exposed by Keycloak.
2. Keycloak authenticates the user with Google Workspace.
3. Keycloak issues a SAML assertion to AWS.
4. AWS maps the SAML assertion to one or more IAM roles.
5. The user lands in the AWS Management Console.

This guide uses direct AWS IAM SAML federation. That is the simplest pattern for a local Keycloak test server.

## Architecture

Authentication source:

- Google Workspace

Federation broker:

- Keycloak

AWS target:

- AWS IAM SAML provider
- AWS IAM roles for console federation

## Prerequisites

- Keycloak is running from this repository
- Google Workspace login already works in your Keycloak realm
- You have an AWS account where you can manage IAM
- You know which Keycloak realm will broker Google login, for example `workspace-test`

## 1. Confirm Google Workspace Login Works First

Before adding AWS, verify that Google login already works in Keycloak:

1. Open the Keycloak realm login page.
2. Sign in with a Google Workspace account.
3. Confirm the user exists in the realm.

If this is not working yet, finish `docs/google-workspace-integration.md` first.

## 2. Create an AWS SAML Client in Keycloak

In the target realm:

1. Go to `Clients`.
2. Create a new client.
3. Set `Client type` to `SAML`.

Recommended initial values for a test setup:

- Client ID: `urn:amazon:webservices`
- Name: `AWS Console`
- IDP-Initiated SSO URL Name: `aws-console`
- Master SAML Processing URL: `https://signin.aws.amazon.com/saml`
- Valid Redirect URIs:
  - `https://signin.aws.amazon.com/saml`
  - `https://*.signin.aws.amazon.com/saml`

Notes:

- AWS supports the global sign-in endpoint `https://signin.aws.amazon.com/saml`.
- AWS also supports regional sign-in endpoints such as `https://us-east-1.signin.aws.amazon.com/saml`.
- For a test setup, starting with the global endpoint is simpler.

## 3. Configure Keycloak SAML Settings for AWS

In the AWS SAML client settings, use these as the starting point:

- Name ID Format: `email`
- Force POST Binding: `On`
- Include AuthnStatement: `On`

In the SAML capability and keys-related settings, ensure Keycloak signs what AWS needs to validate:

- Sign Documents: `On`
- Sign Assertions: `On`

Use your realm signing key and export the client metadata after saving the client.

Keycloak exposes its SAML IdP metadata for the realm at:

```text
http://localhost:8080/realms/<realm-name>/protocol/saml/descriptor
```

For example:

```text
http://localhost:8080/realms/workspace-test/protocol/saml/descriptor
```

Important:

- AWS trusts Keycloak by importing SAML metadata from Keycloak.
- If the Keycloak signing certificate changes, update the AWS SAML provider metadata.

## 4. Create a SAML Identity Provider in AWS IAM

In AWS:

1. Open `IAM`.
2. Go to `Identity providers`.
3. Add a new provider.
4. Provider type: `SAML`.
5. Upload the Keycloak realm SAML metadata XML.
6. Give the provider a name, for example `KeycloakGoogleWorkspace`.

AWS will create an IAM SAML provider ARN similar to:

```text
arn:aws:iam::<account-id>:saml-provider/KeycloakGoogleWorkspace
```

Save that ARN. You will need it in the next step.

## 5. Create an IAM Role for SAML Federation

Create a role in AWS IAM:

1. Go to `Roles`.
2. Choose `Create role`.
3. Choose `SAML 2.0 federation`.
4. Select the SAML provider you created.
5. Choose `Allow programmatic and AWS Management Console access`.
6. Attach the permissions policy you want the federated user to receive.

AWS creates a trust policy for `sts:AssumeRoleWithSAML`. For console access, AWS documents the `saml:aud` condition against the sign-in endpoint.

Your role ARN will look like:

```text
arn:aws:iam::<account-id>:role/KeycloakAdmin
```

## 6. Add AWS SAML Attributes in Keycloak

AWS requires specific SAML attributes in the assertion. The minimum practical set for console login is:

- `https://aws.amazon.com/SAML/Attributes/Role`
- `https://aws.amazon.com/SAML/Attributes/RoleSessionName`

Important:

- These mappers are configured for the AWS SAML client, not in the Google identity provider.
- In current Keycloak UI versions, you may not see a `Mappers` tab directly under the client.
- If that happens, open:
  `Clients` -> `urn:amazon:webservices` -> `Client scopes` -> the dedicated client scope for this client
- Then add the mappers in that dedicated scope's `Mappers` tab.

The dedicated scope name is commonly similar to:

```text
urn:amazon:webservices-dedicated
```

Key point:

- Google IdP configuration controls how users authenticate to Keycloak.
- AWS SAML client mappers control which SAML attributes Keycloak sends to AWS.

### Mapper A: `Role`

Create a mapper in the AWS SAML client or its dedicated client scope that emits:

- Attribute Name: `https://aws.amazon.com/SAML/Attributes/Role`
- Attribute Value:

```text
arn:aws:iam::<account-id>:role/KeycloakAdmin,arn:aws:iam::<account-id>:saml-provider/KeycloakGoogleWorkspace
```

Important:

- The value is a comma-separated pair.
- The role ARN comes first.
- The SAML provider ARN comes second.
- The attribute name is case-sensitive.

For a basic test, use a hardcoded attribute mapper with a single role pair.

### Mapper B: `RoleSessionName`

Create a mapper in the same AWS client scope that emits:

- Attribute Name: `https://aws.amazon.com/SAML/Attributes/RoleSessionName`
- Value: user email

Using the Google Workspace email is the easiest choice because AWS accepts email-like identifiers here.

### Optional Mapper C: `SessionDuration`

If you want a longer console session, add:

- Attribute Name: `https://aws.amazon.com/SAML/Attributes/SessionDuration`
- Value: number of seconds such as `3600`

AWS allows `900` to `43200` seconds, but the effective session is also limited by the IAM role and SAML session conditions.

## 7. Limit AWS Access to the Right Users

Do not expose the AWS SAML client to every user unless that is intentional.

Recommended test pattern:

1. Create a Keycloak group such as `aws-console-users`.
2. Add only approved federated users to that group.
3. Bind the AWS SAML client or mapper behavior to that group.

For a first test, a single hardcoded role mapper is acceptable. After the first successful login, tighten access with groups or role-based mapper logic.

## 8. Expose an AWS Login URL from Keycloak

For IDP-initiated SSO, Keycloak exposes a URL in this format:

```text
http://localhost:8080/realms/<realm-name>/protocol/saml/clients/<client-url-name>
```

With the sample values in this document:

```text
http://localhost:8080/realms/workspace-test/protocol/saml/clients/aws-console
```

That URL is the easiest test entrypoint:

1. Open the URL.
2. Keycloak asks the user to authenticate.
3. The user signs in with Google Workspace.
4. Keycloak posts the SAML response to AWS.
5. AWS opens the console using the mapped IAM role.

## 9. End-to-End Test Sequence

Use this order:

1. Sign out of AWS and Keycloak in your browser.
2. Open the Keycloak AWS login URL.
3. Complete Google Workspace authentication.
4. Confirm AWS opens the console.
5. In AWS, verify the session shows the expected federated role.

If AWS shows a role chooser, the SAML assertion is probably carrying multiple `Role` values.

## 10. Common Problems

### `Access denied` or AWS rejects the assertion

Common causes:

- wrong SAML provider ARN in the `Role` attribute
- wrong IAM role ARN in the `Role` attribute
- missing signature
- stale metadata in AWS after Keycloak certificate changes

Fix:

- re-check the exact `Role` attribute value
- re-import Keycloak metadata into AWS if the cert changed
- confirm the SAML client signs documents and assertions

### User authenticates with Google, but does not reach AWS

Common causes:

- wrong `Master SAML Processing URL`
- missing IDP-initiated client URL name
- invalid ACS/redirect configuration

Fix:

- verify the client posts to `https://signin.aws.amazon.com/saml`
- verify you are opening:
  `http://localhost:8080/realms/<realm-name>/protocol/saml/clients/<client-url-name>`

### AWS says no role is available

Cause:

- the SAML assertion does not contain a valid `Role` attribute

Fix:

- ensure the attribute name is exactly:
  `https://aws.amazon.com/SAML/Attributes/Role`
- ensure the value format is:
  `role-arn,provider-arn`

### Wrong user identity appears in AWS session

Cause:

- `RoleSessionName` is not mapped correctly

Fix:

- map `RoleSessionName` to the Google Workspace email or another stable identifier

## 11. Recommended First-Test Values

Example values:

- Realm: `workspace-test`
- Keycloak AWS client ID: `urn:amazon:webservices`
- Keycloak AWS client URL name: `aws-console`
- Keycloak AWS entry URL:

```text
http://localhost:8080/realms/workspace-test/protocol/saml/clients/aws-console
```

- AWS SAML provider name: `KeycloakGoogleWorkspace`
- AWS SAML provider ARN:

```text
arn:aws:iam::123456789012:saml-provider/KeycloakGoogleWorkspace
```

- AWS IAM role ARN:

```text
arn:aws:iam::123456789012:role/KeycloakAdmin
```

- Keycloak `Role` mapper value:

```text
arn:aws:iam::123456789012:role/KeycloakAdmin,arn:aws:iam::123456789012:saml-provider/KeycloakGoogleWorkspace
```

## 12. Hardening After the First Successful Test

After the first login works:

- replace hardcoded role mappers with group-based or role-based mapping
- use regional AWS sign-in endpoints for resiliency
- review session duration
- restrict which Google Workspace users can reach the AWS client
- rotate and monitor Keycloak signing certificates
- stop using dev credentials and `start-dev`

## References

- AWS IAM SAML federation
  https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html
- AWS IAM SAML provider creation
  https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_saml.html
- AWS IAM role creation for SAML federation
  https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html
- AWS SAML assertion requirements
  https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_saml_assertions.html
- Keycloak Server Administration Guide
  https://www.keycloak.org/docs/latest/server_admin/
