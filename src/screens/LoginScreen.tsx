import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>👨‍👩‍👧‍👦</Text>
      <Text style={styles.appName}>ForThem</Text>
      <Text style={styles.tagline}>Co-parenting, simplified.</Text>

      {/* Phase 2: wire up Google OAuth via Supabase */}
      <TouchableOpacity style={styles.button} disabled>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.note}>Google sign-in coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    opacity: 0.5, // disabled until Phase 2
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
