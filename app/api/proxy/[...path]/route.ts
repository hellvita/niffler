import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.INTERNAL_API_URL!;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const token = (await cookies()).get('auth_token')?.value;

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = `${BACKEND}/api/${path.join('/')}${req.nextUrl.search}`;
  const isMultipart = req.headers.get('content-type')?.startsWith('multipart/');
  const hasBody = req.method !== 'GET' && req.method !== 'DELETE';

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (hasBody) {
    if (isMultipart) {
      // Forward the full Content-Type including the multipart boundary the browser generated
      const ct = req.headers.get('content-type');
      if (ct) headers['Content-Type'] = ct;
    } else {
      headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(url, {
    method: req.method,
    headers,
    // For multipart, stream the body directly to preserve the boundary
    body: hasBody ? (isMultipart ? req.body : await req.text()) : undefined,
    ...(isMultipart && { duplex: 'half' }),
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });

  const contentType = res.headers.get('Content-Type') ?? 'application/json';
  const isBinary =
    contentType.includes('spreadsheetml') ||
    (!contentType.includes('application/json') && !contentType.startsWith('text/'));

  if (isBinary) {
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': res.headers.get('Content-Disposition') ?? '',
      },
    });
  }

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': contentType },
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
