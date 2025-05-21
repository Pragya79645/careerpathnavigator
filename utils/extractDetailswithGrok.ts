// This file handles the interaction with the Groq API through our route handler

export async function extractDetailsWithGrok(resumeText: string) {
  try {
    const response = await fetch("/api/grok-extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Error extracting details with Groq:", error)
    throw new Error(`Failed to analyze resume: ${error.message}`)
  }
}
