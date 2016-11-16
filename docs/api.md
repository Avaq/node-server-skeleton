# API Documentation

## General

### Errors

All API errors will be in JSON format. An erroneous response will have the
following shape:

```txt
400 Status Message
-----
{"name": "NameOfError", "message": "Human-readable message"}
```

### Providing an API version

Any plain request to the API will tell you the following:

```json
{"name":"BadRequestError","message":"No valid API version provided."}
```

This is because every client has to provide the version of the API they wish to
use. This allows the API to make backwards-incompatible changes to certain
end-points, whilst maintaining backwards compatibility with older clients.

The API Version can be provided in two ways. The recommended way is **to send
an `Api-Version` header**. The alternative is to set the `_apiv` query
parameter. The header or query parameter has to contain a fully qualified
[semantic version](http://semver.org/), for example: `Api-Version: 1.1.0`. The
version corresponds to the version in `package.json`.

### Authentication

#### `POST /auth`

Request an authorization token pair:

```txt
POST /auth
Api-Version: 0.1.0
Content-Type: application/json
-----
{"username": "Avaq", "password": "password123"}
```

```txt
200 Ok
Set-Cookie: token=<authorization_token>
-----
{"token": "<authorization_token>", "refresh": "<refresh_token>"}
```

#### `GET /auth`

Determine whether a token is still valid, or why it's not granting you access.

```txt
GET /auth
Api-Version: 0.1.0
Authorization: Bearer: <authorization_token>
```

```txt
200 OK
-----
{
  "authorized": false,
  "groups": ["@unauthorized"],
  "permissions": ["auth.*", "ping"],
  "session": {
    "name": "TokenExpiredError",
    "message": "Token expired"
  }
}
```

The response JSON has the following structure:

* `authorized`: A Boolean indicating whether the request would be authorized.
* `groups`: An Array of groups that the token-holder is a member of.
* `permissions`: An Array of permissions that the token-holder was granted.
* `session`: Will be an Object with a `name` and `message` describing what went
  wrong if `authorized` is `false`; or the Username if `authorized` is `true`.

Errors can be one of:

* `InvalidTokenClaimsError`
* `InvalidTokenTypeError`
* `InvalidSessionTypeError`
* `MissingAuthorizationHeaderError`
* `MissingTokenCookieError`
* `MalformedAuthorizationHeaderError`
* `InvalidAuthorizationHeaderError`
* `TokenExpiredError`

### `PUT /auth`

Refreshes a token-pair.

```js
PUT /auth
Api-Version: 0.1.0
Content-Type: application/json
-----
{"token": "<authorization_token>", "refresh": "<refresh_token>"}
```

```js
200 Ok
Set-Cookie: token=<authorization_token>
-----
{"token": "<authorization_token>", "refresh": "<refresh_token>"}
```

### Authorization

The authorization token obtained by [authenticating](#authentication) can be
included in any requests using the `Authorization: Bearer: `-header, or a cookie
with a `token=`-field. The cookie only works for GET requests, and is intended
to be a fall-back for when a resource is embedded inside an HTML page.

When you are unauthorized to perform a certain requests, the response will
always have status code `403`, and contain a message about the permission you
are missing. To determine why a token might not have given you this permission,
use [`GET /auth`](#get-auth).
