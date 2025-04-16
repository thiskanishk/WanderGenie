const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/generate-trip-options
 * Generates 3-5 unique trip plans based on user preferences using OpenAI
 */
router.post('/api/generate-trip-options', async (req, res) => {
  console.log('Received trip options request:', req.body);
  
  // Extract user preferences from request body
  const { tripType, vibe, budget, duration } = req.body;

  // Validate required fields
  if (!tripType || !vibe || !budget || !duration) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters',
      details: 'Trip type, vibe, budget, and duration are required'
    });
  }

  try {
    // Set up timeout to cap response time - OpenAI typically has its own timeout
    // but we'll add an additional safety measure
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 20000)
    );

    // Create the OpenAI API request
    const openAIPromise = callOpenAI({ tripType, vibe, budget, duration });

    // Race between actual API call and timeout
    const tripPlans = await Promise.race([openAIPromise, timeoutPromise]);

    console.log(`Successfully generated ${tripPlans.length} trip options`);
    
    // Return the generated trip plans
    return res.status(200).json({
      success: true,
      tripPlans
    });
  } catch (error) {
    console.error('Error generating trip options:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate trip options',
      details: error.message || 'Unknown error'
    });
  }
});

/**
 * Calls OpenAI to generate trip plans
 * @param {Object} userPreferences - User's trip preferences
 * @returns {Promise<Array>} - Array of trip plans
 */
async function callOpenAI(userPreferences) {
  const { tripType, vibe, budget, duration } = userPreferences;

  // Using function calling for structured output
  const functionDefinition = {
    name: "generate_trip_suggestions",
    description: "Generate 3-5 unique trip suggestions based on user preferences",
    parameters: {
      type: "object",
      properties: {
        tripPlans: {
          type: "array",
          description: "Array of 3-5 unique trip plans",
          items: {
            type: "object",
            properties: {
              destination: {
                type: "string",
                description: "Name of the destination city/region and country"
              },
              summary: {
                type: "string",
                description: "1-2 sentence overview of the trip experience"
              },
              duration: {
                type: "string",
                description: "Trip duration, based on or adapted from user input"
              },
              budget: {
                type: "string",
                description: "Budget category, based on or adapted from user input"
              },
              tripType: {
                type: "string",
                description: "Type of trip, based on user input"
              },
              image: {
                type: "string",
                description: "URL for a representative image (can be a placeholder)"
              },
              itinerary: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    activities: {
                      type: "array",
                      items: { type: "string" }
                    },
                    morning: {
                      type: "array",
                      items: { type: "string" }
                    },
                    afternoon: {
                      type: "array",
                      items: { type: "string" }
                    },
                    evening: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["day", "activities"]
                }
              },
              tips: {
                type: "array",
                description: "2-3 short helpful travel tips specific to the destination",
                items: { type: "string" }
              },
              accommodation: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  address: { type: "string" },
                  rating: { type: "number" },
                  amenities: {
                    type: "array",
                    items: { type: "string" }
                  },
                  price: { type: "string" }
                }
              }
            },
            required: [
              "destination", "summary", "duration", "budget",
              "tripType", "itinerary", "tips"
            ]
          }
        }
      },
      required: ["tripPlans"]
    }
  };

  try {
    console.log('Sending request to OpenAI for trip options...');
    console.time('openai_trip_options_request');
    
    // Create prompt messages
    const messages = [
      {
        role: "system",
        content: "You are a travel expert who creates personalized trip suggestions based on user preferences. Your suggestions should be diverse, specific, and include realistic details."
      },
      {
        role: "user",
        content: `Please suggest 3-5 trip options for me based on these preferences:
        - Trip type: ${tripType}
        - Vibe: ${vibe}
        - Budget: ${budget}
        - Duration: ${duration}
        
        For each option, include a specific destination, a brief summary, itinerary highlights for each day, and useful travel tips.`
      }
    ];

    // Call OpenAI API with the newer client
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      functions: [functionDefinition],
      function_call: { name: "generate_trip_suggestions" },
      temperature: 0.7,
      max_tokens: 3000
    });
    
    console.timeEnd('openai_trip_options_request');
    console.log('Received response from OpenAI for trip options');

    // Extract function call response
    if (response.choices && response.choices.length > 0) {
      const functionCallMessage = response.choices[0].message;
      
      if (functionCallMessage.function_call) {
        const functionArgs = JSON.parse(functionCallMessage.function_call.arguments);
        return functionArgs.tripPlans;
      }
    }

    // Fallback in case function call doesn't work as expected
    throw new Error('Failed to parse response from OpenAI');
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Enhance error message based on the type of error
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.status || 'Unknown'} - ${error.message || 'Unknown error'}`);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Network error: Unable to reach OpenAI API');
    }
    
    throw error;
  }
}

module.exports = router; 