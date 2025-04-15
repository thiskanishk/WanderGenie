const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/generate-itinerary
router.post('/generate-itinerary', async (req, res) => {
  const { tripType, vibe, budget, duration } = req.body;

  const prompt = `
You are WanderGenie, a travel planning AI assistant. Based on the user's preferences:
- Trip Type: ${tripType}
- Vibe: ${vibe}
- Budget: ${budget}
- Duration: ${duration}

Generate:
1. Destination recommendation
2. Day-wise itinerary
3. Local travel tips
4. Estimated budget summary

Format the response as a JSON object with the following structure:
{
  "destination": "Recommended destination name",
  "duration": "${duration}",
  "budget": "${budget}",
  "itinerary": [
    {
      "day": 1,
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    },
    {
      "day": 2,
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "estimatedCosts": {
    "accommodation": "$X",
    "food": "$X",
    "activities": "$X", 
    "transportation": "$X",
    "total": "$X"
  }
}
`;

  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      response_format: { type: "json_object" }
    });

    // Parse the response to ensure it's valid JSON
    const content = response.choices[0].message.content;
    const tripPlan = JSON.parse(content);

    res.json({ 
      tripPlan,
      userSelections: {
        tripType,
        vibe,
        budget,
        duration
      }
    });
  } catch (error) {
    console.error("AI generation failed:", error);
    res.status(500).json({ 
      error: "AI generation failed", 
      details: error.message 
    });
  }
});

module.exports = router; 