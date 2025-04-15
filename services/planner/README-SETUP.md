# WanderGenie AI Integration Setup Guide

This guide explains how to run and test the OpenAI integration for the WanderGenie app.

## Server Setup

1. Navigate to the planner service directory:
   ```
   cd services/planner
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Verify your `.env` file contains:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

5. Test the server is running:
   ```
   curl http://localhost:3001/health
   ```
   You should receive: `{"status":"ok"}`

## Mobile App Setup

1. Navigate to the mobile directory in a new terminal:
   ```
   cd mobile
   ```

2. Update the API endpoint URL in `HomeScreen.tsx`:
   - Find the line with `fetch("http://192.168.1.4:3001/api/ai/plan"`
   - Replace `192.168.1.4` with your actual local IP address
   - You can find your IP by running:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr` (look for inet)

3. Start the mobile app:
   ```
   npx expo start --offline --clear
   ```

4. Test the integration:
   - Use the Smart Suggestion flow
   - Select trip type, vibe, budget, and duration
   - Click "Generate Smart Plan"
   - You should see log messages in the backend terminal as the request is processed

## Troubleshooting

If you encounter issues:

1. **Network errors**:
   - Make sure your phone and computer are on the same network
   - Verify the IP address is correct
   - Check the port (3001) is not blocked by a firewall

2. **API key errors**:
   - Verify your OpenAI API key is valid and not expired
   - Check the console logs for API errors

3. **Server connection issues**:
   - Verify the server is running with `npm run dev`
   - Check the URL format matches `http://<Your-IP>:3001/api/ai/plan`

4. **Response parsing errors**:
   - Check the server logs for any issues with the OpenAI response format
   - Verify the data structure in the frontend matches what the backend returns 