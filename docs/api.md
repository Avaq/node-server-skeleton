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
{"name":"BadRequestError","message":"No valid API version provided"}
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
{"username": "avaq", "password": "password123"}
```

```txt
200 Ok
Set-Cookie: token=<authorization_token>
-----
{"token": "<authorization_token>", "refresh": "<refresh_token>"}
```

The request might also fail, and the response will have code `400` in case the
request was invalid (like invalid data format), or `401` if the credentials are
invalid (eg. a wrong password or non-existent username).

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
  "authenticated": false,
  "reason": {"name": "TokenExpiredError", "message": "Token expired"}
}
```

The response JSON contains an "authenticated" boolean, indicating whether the
token proves authentication. In cases where the user is not authenticated a
`reason` field will be present with an error explaining what went wrong. If the
user *is* authenticated, then a `session` field will be present containing the
token payload, for your convenience.

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

```txt
PUT /auth
Api-Version: 0.1.0
Content-Type: application/json
-----
{"token": "<authorization_token>", "refresh": "<refresh_token>"}
```

```txt
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
have status code `400` if you provided an invalid token, status code `401` if
your token does not authenticate you or `403` if you are authenticated but
missing the required permissions. The possible error names in the JSON response
are equal to those you get from requesting [`GET /auth`](#get-auth).
