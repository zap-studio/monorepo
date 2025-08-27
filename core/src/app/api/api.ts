import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-actual-production-domain.com',
];

const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
];

export function attachAPIHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Avoid setting large headers as it might cause 431 Request Header Fields Too Large error
  // depending on your backend web server configuration.
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  response.headers.set(
    'Access-Control-Allow-Methods',
    allowedMethods.join(', ')
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    allowedHeaders.join(', ')
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: Object.fromEntries(response.headers),
    });
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  const csp = [
    "default-src 'self'",
    "script-src 'self' ",
    "style-src 'self'",
    "img-src 'self' data: https:;",
    "font-src 'self'",
    "connect-src 'self' https://your-actual-api-domain.com",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  if (pathname.startsWith('/api/v1/')) {
    // Add version specific logic here
    response.headers.set('X-API-Version', '1.0.0');
  }

  return response;
}
