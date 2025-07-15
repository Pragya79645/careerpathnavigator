// app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 Test endpoint called');
  
  return NextResponse.json({
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    nodeVersion: process.version
  });
}

export async function POST(req: NextRequest) {
  console.log('🧪 Test POST endpoint called');
  
  try {
    const body = await req.json();
    console.log('Test POST body:', body);
    
    return NextResponse.json({
      status: 'OK',
      message: 'POST request successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test POST error:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      message: 'POST request failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
