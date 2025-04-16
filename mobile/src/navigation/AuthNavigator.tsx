import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginRegisterScreen from '../screens/LoginRegisterScreen';

// Mock Auth Screens
const RegisterScreen = () => null;
const ForgotPasswordScreen = () => null;

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginRegisterScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: 'Reset Password' }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;