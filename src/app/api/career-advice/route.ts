// File: app/api/career-advice/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Define type for incoming messages
type Message = {
  role: 'user' | 'assistant';
  content: string;
};


// Function to generate wellness suggestions
async function generateWellnessSuggestions(userContext: string, apiKey: string) {
  try {
    const hour = new Date().getHours();
    let timeContext = '';
    
    if (hour < 12) {
      timeContext = 'morning';
    } else if (hour < 17) {
      timeContext = 'afternoon';
    } else {
      timeContext = 'evening';
    }

    const wellnessPrompt = `You are a career counselor and emotional well-being guide with a warm, friendly mentor tone. Based on this user context: "${userContext}" and time: ${timeContext}, detect their emotional state and provide empathetic support.

    YOUR PRIMARY JOB:
    1. Detect emotional state or career mood (nervous, anxious, burnt out, sad, procrastinating, overwhelmed, unmotivated)
    2. If emotional support is needed, suggest helpful resources with genuine empathy
    3. Always reply with empathy FIRST using a friendly mentor tone
    4. Include relevant YouTube links, motivational tips, or sound resources

    IMPORTANT RULES:
    - Use the tone of a friendly mentor, not a clinical therapist
    - Include genuine empathy and validation in your responses
    - DO NOT respond with generic career advice if emotion is detected
    - Start with understanding phrases like "Totally normal to feel that way!", "It's okay to have slow days", "I hear you"

    EMOTIONAL STATE DETECTION:
    - NERVOUS/ANXIOUS: First day jitters, interview anxiety, presentation fears, career uncertainty
    - BURNT OUT: Exhaustion, "can't do this anymore", feeling drained, work overwhelm
    - SAD/DEPRESSED: Low mood, "don't want to do anything", lying in bed, hopeless feelings
    - PROCRASTINATING: Avoiding tasks, "I should be doing X but...", motivation issues
    - OVERWHELMED: Too much to handle, stressed about multiple things, feeling lost
    - UNMOTIVATED: Lack of drive, "what's the point", low energy, disconnected

    PROVIDE TARGETED SUGGESTIONS FROM THESE CATEGORIES:

    STRESS & OVERWHELM:
    - Meditation and mindfulness videos
    - Breathing exercises and relaxation techniques
    - Calming nature sounds and visualizations
    - Stress management strategies

    MOTIVATION & CONFIDENCE:
    - Motivational speeches and talks
    - "You are enough" affirmations
    - Success mindset videos
    - Confidence building exercises

    WORK-LIFE BALANCE:
    - Setting boundaries videos
    - Work-life integration strategies
    - Self-care and wellness practices
    - Energy management techniques

    PROCRASTINATION & TIME MANAGEMENT:
    - Productivity systems and methods
    - Time blocking and planning videos
    - Overcoming procrastination techniques
    - Focus and concentration methods

    COMPARISON & SELF-WORTH:
    - Videos about not comparing yourself to others
    - Self-acceptance and self-compassion
    - Building authentic confidence
    - Personal growth and development

    BURNOUT & RECOVERY:
    - Burnout recovery strategies
    - Rest and restoration practices
    - Mental health awareness
    - Sustainable work practices

    Format as JSON with these specific fields:
    {
      "suggestions": [
        {
          "type": "stress|motivation|worklife|productivity|selfworth|burnout",
          "title": "Empathetic, mentor-like title that validates their feelings",
          "description": "Warm, understanding description that acknowledges their emotional state",
          "duration": "X minutes",
          "action": "Gentle, actionable step they can take right now",
          "empathyMessage": "Opening empathetic response like 'Totally normal to feel that way!' or 'I hear you, that sounds tough'",
          "resources": {
            "youtube": "Specific YouTube URL for their emotional state",
            "sounds": "Calming or energizing sounds based on their mood",
            "apps": "Helpful apps for their specific emotional need"
          },
          "tags": ["emotional-state", "relevant", "tags"]
        }
      ]
    }

    EXAMPLE RESPONSES BY EMOTIONAL STATE:

    NERVOUS/ANXIOUS EXAMPLE:
    "Totally normal to feel that way! Here's a calming video to ease your nerves: [link]. Remember, you've got this!"

    SAD/UNMOTIVATED EXAMPLE:
    "It's okay to have slow days. This motivational playlist might help gently boost your energy: [link]. Be gentle with yourself."

    BURNT OUT EXAMPLE:
    "I hear you, that sounds exhausting. You need and deserve rest. Here's a gentle recovery video: [link]. Take it one step at a time."

    PROCRASTINATING EXAMPLE:
    "We've all been there! Sometimes we just need a little nudge. This 5-minute motivation boost might help: [link]. Start small, you can do this!"

    SPECIFIC VIDEO RECOMMENDATIONS BY EMOTIONAL STATE:

    For NERVOUS/ANXIOUS:
    - "Calm Your Nerves Before Big Moments" - https://www.youtube.com/watch?v=inpok4MKVLM
    - "5-Minute Anxiety Relief Meditation" - https://www.youtube.com/watch?v=YRPh_GaiL8s
    - "First Day Jitters? You've Got This!" - https://www.youtube.com/watch?v=aXItOY0sLRY
    - "Interview Anxiety Relief" - https://www.youtube.com/watch?v=DbDoBzGY3vo

    For SAD/UNMOTIVATED:
    - "Gentle Motivation for Hard Days" - https://www.youtube.com/watch?v=Ks-_Mh1QhMc
    - "It's Okay to Have Slow Days" - https://www.youtube.com/watch?v=tOAEEDMojRg
    - "Morning Energy Boost Playlist" - https://www.youtube.com/watch?v=WPPPFqsECz0
    - "Self-Compassion for Difficult Times" - https://www.youtube.com/watch?v=inpok4MKVLM

    For BURNT OUT:
    - "You Deserve Rest - Recovery Video" - https://www.youtube.com/watch?v=RqcOCBb4arc
    - "Gentle Burnout Recovery" - https://www.youtube.com/watch?v=aXItOY0sLRY
    - "Healing from Work Exhaustion" - https://www.youtube.com/watch?v=DbDoBzGY3vo

    For PROCRASTINATING:
    - "5-Minute Motivation Boost" - https://www.youtube.com/watch?v=tOAEEDMojRg
    - "Gentle Productivity for Overwhelmed Minds" - https://www.youtube.com/watch?v=YRPh_GaiL8s
    - "Start Small, Win Big" - https://www.youtube.com/watch?v=RqcOCBb4arc

    For OVERWHELMED:
    - "When Everything Feels Too Much" - https://www.youtube.com/watch?v=WPPPFqsECz0
    - "Grounding Techniques for Overwhelm" - https://www.youtube.com/watch?v=inpok4MKVLM
    - "One Thing at a Time" - https://www.youtube.com/watch?v=aXItOY0sLRY

    EMOTIONAL STATE MATCHING RULES:
    - If user mentions "nervous", "anxious", "first day", "interview", "presentation" → provide calming, reassuring content
    - If user mentions "sad", "don't want to do anything", "lying in bed", "unmotivated" → provide gentle motivation
    - If user mentions "burnt out", "exhausted", "can't do this anymore", "drained" → provide rest and recovery content
    - If user mentions "procrastinating", "avoiding", "should be doing but", "can't start" → provide gentle productivity nudges
    - If user mentions "overwhelmed", "too much", "everything is", "stressed" → provide grounding and simplification
    - If user mentions "tired", "low energy", "disconnected", "what's the point" → provide energy and purpose content

    TONE GUIDELINES:
    - Start with validation: "Totally normal to feel that way!", "It's okay to have slow days", "I hear you"
    - Use encouraging phrases: "You've got this!", "Be gentle with yourself", "Take it one step at a time"
    - Avoid clinical language, use warm mentor language
    - Include actionable but gentle suggestions
    - End with hope and reassurance

    Always match the emotional tone and provide resources that specifically address their current emotional state, not just career advice.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'user', content: wellnessPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Clean up JSON response
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.suggestions?.map((suggestion: any, index: number) => ({
        id: `wellness-${Date.now()}-${index}`,
        type: suggestion.type || 'motivation',
        title: suggestion.title || 'Wellness Boost',
        description: suggestion.description || 'A helpful intervention for your well-being.',
        duration: suggestion.duration || '3-5 minutes',
        action: suggestion.action || 'Take a moment to focus on your well-being.',
        empathyMessage: suggestion.empathyMessage || 'I understand how you\'re feeling.',
        resources: suggestion.resources || {},
        tags: suggestion.tags || [],
        icon: getIconForType(suggestion.type || 'motivation'),
        color: getColorForType(suggestion.type || 'motivation')
      })) || [];
    } catch {
      return getFallbackSuggestions();
    }
  } catch (error) {
    console.error('Error generating wellness suggestions:', error);
    return getFallbackSuggestions();
  }
}

function getIconForType(type: string) {
  const iconMap: { [key: string]: string } = {
    stress: 'Wind',
    motivation: 'TrendingUp',
    worklife: 'Balance',
    productivity: 'Zap',
    selfworth: 'Heart',
    burnout: 'Battery',
    calmness: 'Wind',
    learning: 'BookOpen',
    break: 'Coffee',
    physical: 'Activity',
    mental: 'Brain',
    energy: 'Battery',
    focus: 'Target',
    creativity: 'Lightbulb',
    mindfulness: 'Heart',
    relaxation: 'Smile'
  };
  return iconMap[type] || 'Sparkles';
}

function getColorForType(type: string) {
  const colorMap: { [key: string]: string } = {
    stress: 'blue',
    motivation: 'orange',
    worklife: 'green',
    productivity: 'teal',
    selfworth: 'pink',
    burnout: 'red',
    calmness: 'blue',
    learning: 'purple',
    break: 'amber',
    physical: 'teal',
    mental: 'indigo',
    energy: 'orange',
    focus: 'cyan',
    creativity: 'yellow',
    mindfulness: 'emerald',
    relaxation: 'rose'
  };
  return colorMap[type] || 'purple';
}

function getFallbackSuggestions() {
  const fallbackOptions = [
    {
      type: 'stress',
      title: 'Feeling overwhelmed? Let\'s find some calm together',
      description: 'This guided meditation helps calm your nervous system and reduce stress in just a few minutes.',
      duration: '5 minutes',
      action: 'Find a quiet space, sit comfortably, close your eyes, and follow the guided meditation.',
      empathyMessage: 'Totally normal to feel overwhelmed sometimes! Take a deep breath - you\'ve got this.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=inpok4MKVLM',
        sounds: 'Ocean waves, rainfall, or forest sounds',
        apps: 'Headspace, Calm, Insight Timer'
      },
      tags: ['stress', 'meditation', 'relaxation'],
      icon: 'Wind',
      color: 'blue'
    },
    {
      type: 'motivation',
      title: 'Having a tough day? Here\'s a gentle reminder of your worth',
      description: 'A warm reminder that you are capable, worthy, and enough exactly as you are.',
      duration: '4 minutes',
      action: 'Watch this video and let the message sink in. You are not behind in life, you are on your own journey.',
      empathyMessage: 'I hear you, and I want you to know that it\'s okay to have slow days. Be gentle with yourself.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
        sounds: 'Inspirational background music',
        apps: 'Daily affirmations apps'
      },
      tags: ['motivation', 'self-worth', 'confidence'],
      icon: 'TrendingUp',
      color: 'orange'
    },
    {
      type: 'worklife',
      title: 'Feeling stretched thin? Let\'s find some balance',
      description: 'Learn practical strategies to set boundaries and create better balance between work and personal life.',
      duration: '6 minutes',
      action: 'Watch the video and choose one boundary-setting technique to implement today.',
      empathyMessage: 'Work-life balance is tough for everyone! You\'re not alone in struggling with this.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=RqcOCBb4arc',
        sounds: 'Calming background music',
        apps: 'Time-blocking apps like Toggl or RescueTime'
      },
      tags: ['work-life-balance', 'boundaries', 'wellness'],
      icon: 'Balance',
      color: 'green'
    },
    {
      type: 'productivity',
      title: 'Can\'t seem to start? Let\'s break it down together',
      description: 'The 2-minute rule can help you overcome procrastination and build momentum.',
      duration: '3 minutes',
      action: 'If a task takes less than 2 minutes, do it now. For bigger tasks, just start with 2 minutes.',
      empathyMessage: 'We\'ve all been there! Sometimes we just need a little nudge. Start small - you can do this!',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=tOAEEDMojRg',
        sounds: 'Focus music or brown noise',
        apps: 'Forest, Pomodoro Timer, Todoist'
      },
      tags: ['procrastination', 'productivity', 'focus'],
      icon: 'Zap',
      color: 'teal'
    },
    {
      type: 'selfworth',
      title: 'Comparing yourself to others? Your journey is unique',
      description: 'Learn why comparison is the thief of joy and how to focus on your own path.',
      duration: '7 minutes',
      action: 'Watch this video and practice gratitude for your unique journey and progress.',
      empathyMessage: 'Comparison is so hard to avoid, but remember - you\'re exactly where you need to be.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=WPPPFqsECz0',
        sounds: 'Peaceful instrumental music',
        apps: 'Gratitude journal apps'
      },
      tags: ['comparison', 'self-acceptance', 'personal-growth'],
      icon: 'Heart',
      color: 'pink'
    },
    {
      type: 'burnout',
      title: 'Feeling exhausted? You deserve rest and recovery',
      description: 'Learn to identify burnout symptoms and discover practical recovery techniques.',
      duration: '8 minutes',
      action: 'Watch this video and assess your current state. Take notes on which recovery strategies resonate.',
      empathyMessage: 'I hear you, that sounds exhausting. You need and deserve rest. Take it one step at a time.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=DbDoBzGY3vo',
        sounds: 'Nature sounds for healing',
        apps: 'Mental health apps like Sanvello or Mindfulness'
      },
      tags: ['burnout', 'recovery', 'mental-health'],
      icon: 'Battery',
      color: 'red'
    },
    {
      type: 'calmness',
      title: 'Need to find your center? Let\'s breathe together',
      description: 'The 4-7-8 breathing technique activates your relaxation response immediately.',
      duration: '4 minutes',
      action: 'Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4-6 times.',
      empathyMessage: 'Anxiety can feel overwhelming, but you have the power to calm your nervous system. Let\'s try this together.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
        sounds: 'Guided breathing audio',
        apps: 'Breathe app, Wim Hof Method'
      },
      tags: ['breathing', 'anxiety', 'calm'],
      icon: 'Wind',
      color: 'blue'
    },
    {
      type: 'motivation',
      title: 'Starting fresh? Let\'s build some positive momentum',
      description: 'Energizing affirmations and mindset shifts to boost your confidence and motivation.',
      duration: '5 minutes',
      action: 'Watch this every morning for a week and notice how it affects your mindset.',
      empathyMessage: 'Every day is a fresh start! You have everything you need within you to succeed.',
      resources: {
        youtube: 'https://www.youtube.com/watch?v=aXItOY0sLRY',
        sounds: 'Uplifting music',
        apps: 'Daily motivation apps'
      },
      tags: ['morning-routine', 'motivation', 'positivity'],
      icon: 'TrendingUp',
      color: 'orange'
    }
  ];

  // Return 2 random suggestions from the fallback options
  const shuffled = fallbackOptions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2).map((suggestion, index) => ({
    id: `fallback-${Date.now()}-${index}`,
    ...suggestion
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // Validate request data
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get Groq API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('Missing GROQ_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Prepare the system message with cleaner formatting instructions
    const systemMessage = {
      role: 'system',
      content: `You are a professional career counselor with extensive knowledge of various industries, job markets, career paths, and professional development strategies. Your goal is to provide personalized, practical career advice based on the user's specific situation and questions.

      Guidelines:
      - Give thoughtful, nuanced career advice that considers multiple perspectives
      - Provide specific, actionable recommendations
      - Support your advice with relevant industry insights and best practices
      - Be encouraging and empathetic while remaining realistic
      - Avoid giving generic answers; tailor your responses to the user's specific career situation
      - Ask clarifying questions when needed to provide better guidance
      
      Response Formatting Instructions:
      1. Use clear, simple formatting:
         - For main headings: Use the # symbol (e.g., "# Career Options")
         - For subheadings: Use ## or ### (e.g., "## Next Steps")
         - For emphasis: Use colons sparingly only for truly important points (e.g., ":Key insight:")
      
      2. For lists, follow these rules:
         - For bullet points, use dashes followed by meaningful content (e.g., "- Your point here")
         - For numbered lists, use consecutive numbers (e.g., "1. First point", "2. Second point")
         - Ensure each list item contains substantial content
      
      3. Format special sections using these patterns (use sparingly):
         - "ACTION: Brief description of what to do"
         - "TIP: Brief advice on a particular topic"
         - "NOTE: Important information to remember"
         - "EXAMPLE: Brief illustrative scenario"
      
      4. Structure your responses with clear organization:
         - Start with a brief introduction addressing the user's question
         - Use headings to separate main sections
         - Group related information logically
         - End with a concise conclusion
      
      Current date: ${new Date().toLocaleDateString()}`
    };

    // Prepare the messages array to send to Groq
    const allMessages = [
      systemMessage,
      ...messages.map((message: Message) => ({
        role: message.role,
        content: message.content
      }))
    ];

    // Make request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Error from language model API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let processedResponse = data.choices[0].message.content;

    // Ensure list completeness
    const numberedListRegex = /\d+\.\s*$/m;
    if (numberedListRegex.test(processedResponse)) {
      processedResponse = processedResponse.replace(numberedListRegex, (match: any) => `${match}[This point needs completion]`);
    }

    const bulletListRegex = /-\s*$/m;
    if (bulletListRegex.test(processedResponse)) {
      processedResponse = processedResponse.replace(bulletListRegex, (match: any) => `${match}[This point needs completion]`);
    }

    // Clean stars and asterisks from markdown
    processedResponse = processedResponse
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold markdown
      .replace(/\*(.*?)\*/g, '$1');    // remove italic markdown

    // Generate wellness suggestions based on conversation context
    const wellnessSuggestions = await generateWellnessSuggestions(messages[messages.length - 1]?.content || '', apiKey);

    return NextResponse.json({ 
      response: processedResponse,
      wellnessSuggestions 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
