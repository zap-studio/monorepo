# API Documentation

This document outlines the structure and best practices for the Zap.ts API.

## Base URL

All API endpoints are prefixed with `/api`.

## Versioning

API versioning is done through the URL path. The current version is `v1`.

Example: `/api/v1/users`

## Authentication

Authentication is handled via Bearer tokens in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response

```json
{
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": {}
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not allowed for this endpoint
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## CORS

Cross-Origin Resource Sharing is enabled for configured origins. The following headers are included in responses:

- `Access-Control-Allow-Origin` - Allowed origins
- `Access-Control-Allow-Methods` - Allowed HTTP methods
- `Access-Control-Allow-Headers` - Allowed headers
- `Access-Control-Allow-Credentials` - Whether credentials are supported

## Security Headers

The API includes the following security headers by default:

- `Content-Security-Policy` - Controls resources the browser is allowed to load
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features

## Health Check

```
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Error Handling

All errors return a JSON response with an error message and optional details. Example:

```json
{
  "error": "Validation failed",
  "details": {
    "name": {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "message": "String must contain at least 2 character(s)"
    }
  }
}
```

## Best Practices

1. **Versioning**: Always include the API version in the URL path
2. **Validation**: Validate all input data using Zod schemas
3. **Error Handling**: Provide meaningful error messages and status codes
4. **Security**: Always use HTTPS, validate all inputs, and implement proper authentication
5. **Documentation**: Keep this documentation up to date with all API changes
6. **Testing**: Write tests for all API endpoints
7. **Logging**: Log all errors and important events
8. **Pagination**: Implement pagination for collection endpoints
9. **Rate Limiting**: Protect your API from abuse
10. **Caching**: Use appropriate cache headers for better performance

## Example Requests

### Create a User

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### List Users

```http
GET /api/v1/users
Authorization: Bearer <token>
```
