import React, {useEffect, useState} from 'react';
import {StatusBar, ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Session} from '@supabase/supabase-js';
import {supabase} from './src/lib/supabase/supabase';
import AuthScreen from './src/screens/AuthScreen';
import GamesScreen from './src/screens/GamesScreen';

export type RootStackParamList = {
  Auth: undefined;
  Games: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({data: {session: s}}) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
      },
    );

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23'}}>
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: '#0f0f23'},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: '600'},
          contentStyle: {backgroundColor: '#0f0f23'},
        }}>
        {session ? (
          // User is logged in → show Games
          <Stack.Screen
            name="Games"
            component={GamesScreen}
            options={{title: 'Games'}}
          />
        ) : (
          // User is NOT logged in → show Auth
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}