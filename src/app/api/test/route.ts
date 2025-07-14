export async function GET() {
  return Response.json({ 
    status: "API is working",
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ 
    echo: body,
    status: "POST request received",
    timestamp: new Date().toISOString()
  });
}
