export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    // Using Google's Gemini API
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await res.json();

    console.log("Gemini Raw Response:", JSON.stringify(data, null, 2));

    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates.length || !data.candidates[0].content) {
      return new Response(
        JSON.stringify({ answer: "I'm having trouble generating a response right now. Please try again!" }), 
        { status: 200 }
      );
    }

    // Extract the text from Gemini's response structure
    const answer = data.candidates[0].content.parts[0].text;

    return Response.json({ answer });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ answer: "I'm experiencing some technical difficulties. Please try again in a moment!" }), 
      { status: 500 }
    );
  }
}