import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import PatientLookupScreen from './src/screens/PatientLookupScreen';
import PatientHistoryScreen from './src/screens/PatientHistoryScreen';
import ConsultationScreen from './src/screens/ConsultationScreen';
import PrescriptionsScreen from './src/screens/PrescriptionsScreen';
import LabOrderScreen from './src/screens/LabOrderScreen';
import LabTechDashboardScreen from './src/screens/LabTechDashboardScreen';
import LabResultEntryScreen from './src/screens/LabResultEntryScreen';
import AnalyticsDashboardScreen from './src/screens/AnalyticsDashboardScreen';
import { View, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'patients', icon: 'people', label: 'Patient Lookup', color: '#059669', screen: 'PatientLookup', roles: ['doctor', 'nurse', 'national_super_user'] },
    { id: 'prescriptions', icon: 'medical', label: 'Prescriptions', color: '#f43f5e', screen: 'Prescriptions', roles: ['pharmacist', 'doctor', 'national_super_user'] },
    { id: 'lab_orders', icon: 'flask', label: 'Lab Orders', color: '#8b5cf6', screen: 'LabTechDashboard', roles: ['lab_tech', 'national_super_user'] },
    { id: 'dashboard', icon: 'stats-chart', label: 'Insights', color: '#2563eb', screen: 'AnalyticsDashboard', roles: ['national_super_user', 'ministry_official', 'institution_it_admin'] },
  ];

  const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <View style={styles.home}>
      <StatusBar barStyle="light-content" backgroundColor="#005a30" />
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.homeGreeting}>Welcome back,</Text>
          <Text style={styles.homeName}>{user?.full_name || 'Staff'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.roleBar}>
        <Ionicons name="shield-checkmark" size={14} color="#059669" />
        <Text style={styles.roleText}>{user?.role?.replace(/_/g, ' ').toUpperCase() || 'STAFF'}</Text>
      </View>

      <View style={styles.menuGrid}>
        {filteredMenu.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" style={{ marginTop: 4 }} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statusCard}>
        <Ionicons name="cloud-done" size={20} color="#059669" />
        <View>
          <Text style={styles.statusTitle}>E-ChroniBook Connected</Text>
          <Text style={styles.statusSub}>Synced with national EMR backbone</Text>
        </View>
      </View>
    </View>
  );
}

function AppNavigator() {
  const { token, restore } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restore().finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#005a30' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PatientLookup" component={PatientLookupScreen} options={{ title: 'Patient Lookup' }} />
            <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} options={{ title: 'Medical History' }} />
            <Stack.Screen name="Consultation" component={ConsultationScreen} options={{ title: 'Clinical Consultation' }} />
            <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ title: 'Prescriptions' }} />
            <Stack.Screen name="LabOrder" component={LabOrderScreen} options={{ title: 'Place Lab Order' }} />
            <Stack.Screen name="LabTechDashboard" component={LabTechDashboardScreen} options={{ title: 'Lab Dashboard' }} />
            <Stack.Screen name="LabResultEntry" component={LabResultEntryScreen} options={{ title: 'Enter Results' }} />
            <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} options={{ title: 'Health Dashboard' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  home: { flex: 1, backgroundColor: '#f8fafc' },
  homeHeader: {
    backgroundColor: '#005a30',
    paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  homeGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  homeName: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  logoutBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  roleBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 24, marginTop: 16,
    backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: 11, fontWeight: '800', color: '#059669', letterSpacing: 1 },
  menuGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14,
    paddingHorizontal: 24, paddingTop: 24,
  },
  menuCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  menuLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 24, marginTop: 28,
    backgroundColor: '#fff', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#d1fae5',
  },
  statusTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  statusSub: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2 },
});
