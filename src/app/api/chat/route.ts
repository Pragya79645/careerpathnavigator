export async function POST(req: Request) {
    const { prompt } = await req.json();
  
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });
  
      const data = await res.json();
  
      console.log("Groq Raw Response:", JSON.stringify(data, null, 2)); // <-- Add this
  
      if (!data.choices || !data.choices.length) {
        return new Response(JSON.stringify({ answer: "Sorry, I couldn't process your request." }), { status: 200 });
      }
  
      return Response.json({ answer: data.choices[0].message.content });
    } catch (error) {
      console.error("Groq API Error:", error); // <-- Add this
      return new Response(JSON.stringify({ answer: "Something went wrong. Please try again later." }), { status: 500 });
    }
  }