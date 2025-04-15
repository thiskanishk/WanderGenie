const { gql } = require('graphql-tag');

const typeDefs = gql`
  # Extend the base schema for federation
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  # User type with @key directive for federation
  type User @key(fields: "id") {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String
    phoneNumber: String
    profilePicture: String
    authProvider: AuthProvider
    isEmailVerified: Boolean!
    status: UserStatus!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
    roles: [Role!]!
    preferences: UserPreference
  }

  # User preference settings
  type UserPreference {
    id: ID!
    userId: ID!
    language: String
    currency: String
    timeZone: String
    notificationPreferences: NotificationPreferences
    createdAt: String!
    updatedAt: String!
  }

  # Notification settings
  type NotificationPreferences {
    email: Boolean!
    push: Boolean!
    sms: Boolean!
    inApp: Boolean!
  }

  # User roles
  type Role {
    id: ID!
    name: String!
    description: String
  }

  # Auth token response
  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  # Enums
  enum AuthProvider {
    LOCAL
    GOOGLE
    APPLE
    FACEBOOK
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  # Input types
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    phoneNumber: String
    profilePicture: String
  }

  input UpdatePasswordInput {
    oldPassword: String!
    newPassword: String!
  }

  input SocialLoginInput {
    provider: AuthProvider!
    token: String!
  }

  input NotificationPreferencesInput {
    email: Boolean
    push: Boolean
    sms: Boolean
    inApp: Boolean
  }

  input UserPreferenceInput {
    language: String
    currency: String
    timeZone: String
    notificationPreferences: NotificationPreferencesInput
  }

  # Queries
  type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
  }

  # Mutations
  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    socialLogin(input: SocialLoginInput!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    updateUser(input: UpdateUserInput!): User!
    updatePassword(input: UpdatePasswordInput!): Boolean!
    updateUserPreferences(input: UserPreferenceInput!): UserPreference!
    verifyEmail(token: String!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    deleteAccount: Boolean!
  }
`;

module.exports = typeDefs; 