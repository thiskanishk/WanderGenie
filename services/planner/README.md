# WanderGenie AI Planner Service

This service handles AI-powered trip planning for the WanderGenie mobile app.

## Features

- Integrates with OpenAI API to generate personalized travel itineraries
- Provides a RESTful API for trip plan generation
- Returns structured trip plans with destination recommendations, day-wise itineraries, tips, and budget breakdown

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory (already created in this setup) with:

```
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

Note: For security, never commit your API key to version control. The key in this demo should be replaced with a real key and kept secure.

## Running the Service

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

## API Endpoints

### Generate Trip Itinerary

Generates a personalized trip itinerary based on user preferences.

- **URL**: `/api/generate-itinerary`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "tripType": "Beach", 
    "vibe": "Relaxing", 
    "budget": "Mid-Range", 
    "duration": "1-2 Weeks"
  }
  ```
- **Success Response**:
  ```json
  {
    "tripPlan": {
      "destination": "Bali, Indonesia",
      "duration": "1-2 Weeks",
      "budget": "Mid-Range",
      "itinerary": [
        {
          "day": 1,
          "activities": [
            "Arrival and check-in to hotel", 
            "Evening exploration of local area",
            "Welcome dinner at popular local restaurant"
          ]
        },
        // More days...
      ],
      "tips": [
        "Pack appropriate clothing for the season",
        // More tips...
      ],
      "estimatedCosts": {
        "accommodation": "$500",
        "food": "$300",
        "activities": "$200",
        "transportation": "$400",
        "total": "$1400"
      }
    },
    "userSelections": {
      "tripType": "Beach",
      "vibe": "Relaxing",
      "budget": "Mid-Range",
      "duration": "1-2 Weeks"
    }
  }
  ```

## Health Check

Check if the service is running properly.

- **URL**: `/health`
- **Method**: `GET`
- **Success Response**: `{"status": "ok"}` 