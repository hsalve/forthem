import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CARDS = [
  { emoji: '📅', label: 'Next Handoff', value: 'Friday 6:00 PM' },
  { emoji: '🔄', label: 'Pending Swaps', value: '1 request' },
  { emoji: '💰', label: 'Open Expenses', value: '$124.50' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.subtitle}>Here's what's coming up</Text>

        {CARDS.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.cardEmoji}>{card.emoji}</Text>
            <View>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.phase}>
          Phase 1 placeholder — real data in Phase 3
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardEmoji: { fontSize: 32 },
  cardLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  cardValue: { fontSize: 17, color: '#1F2937', fontWeight: '700', marginTop: 2 },
  phase: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 16 },
});
