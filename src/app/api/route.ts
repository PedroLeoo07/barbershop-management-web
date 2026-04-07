import { NextResponse } from 'next/server';

// Simple health check route - NO dependencies
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Backend está funcionando!',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth/login',
      services: '/api/services',
      barbers: '/api/barbers',
    }
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'POST funcionando!',
  });
}
