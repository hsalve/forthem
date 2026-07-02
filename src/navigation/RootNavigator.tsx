import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import {
  Home, CalendarDays, ArrowLeftRight, Receipt, FolderOpen,
} from 'lucide-react-native';

import { AuthProvider, useAuth }     from '../context/AuthContext';
import { FamilyProvider, useFamily } from '../context/FamilyContext';

// Auth screens
import LoginScreen          from '../screens/LoginScreen';
import SignUpScreen         from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Setup screens
import SetupFamilyScreen   from '../screens/setup/SetupFamilyScreen';
import InvitePartnerScreen from '../screens/setup/InvitePartnerScreen';
import AddChildScreen      from '../screens/setup/AddChildScreen';
import AcceptInviteScreen  from '../screens/setup/AcceptInviteScreen';

// Main screens
import HomeScreen      from '../screens/HomeScreen';
import CalendarScreen  from '../screens/CalendarScreen';
import SwapsScreen     from '../screens/SwapsScreen';
import ExpensesScreen  from '../screens/ExpensesScreen';
import DocumentsScreen from '../screens/DocumentsScreen';

import { Colors, Radius } from '../theme';

// ── Param lists ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login:          undefined;
  SignUp:         undefined;
  ForgotPassword: undefined;
};

export type SetupStackParamList = {
  SetupFamily:   undefined;
  InvitePartner: { familyId: string; familyName: string };
  AddChild:      { familyId: string };
  AcceptInvite:  { token: string };
};

export type MainTabParamList = {
  Home:      undefined;
  Calendar:  undefined;
  Swaps:     undefined;
  Expenses:  undefined;
  Documents: undefined;
};

const AuthStack  = createNativeStackNavigator<AuthStackParamList>();
const SetupStack = createNativeStackNavigator<SetupStackParamList>();
const Tab        = createBottomTabNavigator<MainTabParamList>();

// ── Auth navigator ────────────────────────────────────────────────────────────

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Login"          component={LoginScreen}          />
      <AuthStack.Screen name="SignUp"         component={SignUpScreen}         />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// ── Setup navigator ───────────────────────────────────────────────────────────

function SetupNavigator() {
  return (
    <SetupStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <SetupStack.Screen name="SetupFamily"   component={SetupFamilyScreen}   />
      <SetupStack.Screen name="InvitePartner" component={InvitePartnerScreen} />
      <SetupStack.Screen name="AddChild"      component={AddChildScreen}      />
      <SetupStack.Screen name="AcceptInvite"  component={AcceptInviteScreen}  />
    </SetupStack.Navigator>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

type TabName = keyof MainTabParamList;
const TAB_ICON: Record<TabName, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  Home:      Home,
  Calendar:  CalendarDays,
  Swaps:     ArrowLeftRight,
  Expenses:  Receipt,
  Documents: FolderOpen,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const Icon = TAB_ICON[route.name as TabName];
        return {
          headerShown:             false,
          tabBarActiveTintColor:   Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarLabelStyle:        styles.tabLabel,
          tabBarStyle:             styles.tabBar,
          tabBarItemStyle:         styles.tabItem,
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon size={20} color={color} strokeWidth={focused ? 2.2 : 1.5} />
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ tabBarLabel: 'Home'      }} />
      <Tab.Screen name="Calendar"  component={CalendarScreen}  options={{ tabBarLabel: 'Calendar'  }} />
      <Tab.Screen name="Swaps"     component={SwapsScreen}     options={{ tabBarLabel: 'Swaps'     }} />
      <Tab.Screen name="Expenses"  component={ExpensesScreen}  options={{ tabBarLabel: 'Expenses'  }} />
      <Tab.Screen name="Documents" component={DocumentsScreen} options={{ tabBarLabel: 'Documents' }} />
    </Tab.Navigator>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

// ── Root: three-state routing ─────────────────────────────────────────────────
// State machine:
//   no session              → AuthNavigator
//   session + no family     → SetupNavigator
//   session + family exists → MainTabs

function NavigationRoot() {
  const { session, loading: authLoading }     = useAuth();
  const { familyId, loading: familyLoading }  = useFamily();

  // Show spinner while restoring session OR loading family
  const isLoading = authLoading || (!!session && familyLoading);
  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {!session ? (
        // Not logged in
        <AuthNavigator />
      ) : !familyId ? (
        // Logged in but no family yet
        <SetupNavigator />
      ) : (
        // Fully set up
        <MainTabs />
      )}
    </NavigationContainer>
  );
}

// ── Providers ─────────────────────────────────────────────────────────────────

export default function RootNavigator() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <NavigationRoot />
      </FamilyProvider>
    </AuthProvider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loading:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  tabBar:         { backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border, height: 62, paddingBottom: 8, paddingTop: 6, shadowColor: '#3B3F8C', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 8 },
  tabItem:        { paddingTop: 2 },
  tabLabel:       { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
  iconWrap:       { width: 36, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.primary + '14' },
});
