import { createStackNavigator } from '@react-navigation/stack';
import EntryScreen from '../screens/EntryScreen';
import MainTabNavigator from './MainTabNavigator';

type RootStackParamList = {
  Entry: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <Stack.Screen 
        name="Entry" 
        component={EntryScreen}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
      />
    </Stack.Navigator>
  );
} 