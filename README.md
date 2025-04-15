# WanderGenie - AI-Powered Travel Planning App

WanderGenie is a mobile-first travel planning application that leverages AI models like OpenAI, Gemini, and DeepSeek to help users create personalized travel itineraries. Users can share plans, collaborate with friends, and access their trips offline.

## Architecture

### Frontend
- React Native with Redux Toolkit
- Apollo Client for GraphQL
- React Navigation
- Offline sync via AsyncStorage/MMKV

### Backend
- Node.js microservices with Express
- GraphQL gateway (Apollo Server)
- REST endpoints for external integrations

### Databases
- PostgreSQL (users, billing, sharing)
- MongoDB (trips, locations, checklists)
- Redis (caching, queues)

### AI Layer
- Custom LLM router connecting to OpenAI, Gemini, DeepSeek

### Infrastructure
- Docker + Kubernetes
- AWS (EKS, S3, CloudFront)
- CI/CD via GitHub Actions

## Directory Structure

```
/
├── mobile/             # React Native app
├── gateway/            # Apollo GraphQL Gateway
├── services/           # Microservices
│   ├── user/           # User management, auth
│   ├── trip/           # Trip planning, itineraries
│   ├── planner/        # AI planning logic
│   ├── sharing/        # Collaboration features
│   ├── notification/   # Push/email notifications
│   ├── subscription/   # Premium plans, billing
│   ├── location/       # Location data, insights
│   └── checklist/      # Trip checklists
└── infra/              # Kubernetes, Terraform, CI/CD
```

## Getting Started

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- PostgreSQL
- MongoDB
- Redis

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/wandergenie.git
cd wandergenie
```

2. Install dependencies:
```
npm install
```

3. Start the development environment:
```
npm run dev
```

## Features

- AI-powered travel itinerary generation
- Collaboration and sharing
- Offline access to trips and checklists
- Customizable plans with editing capabilities
- Premium subscription options
- Multi-platform mobile support (iOS, Android)

## License

MIT 