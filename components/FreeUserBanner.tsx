import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import GoldButton from '@/components/GoldButton';
import { BUY_TICKET_URL } from '@/constants/config';

const PERKS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'rocket-outline', text: 'Live Ship Tracker for your starship' },
  { icon: 'speedometer-outline', text: 'Real-time distance & progress indicators' },
  { icon: 'radio-outline', text: 'Earth–Mars communication metrics' },
];

export default function FreeUserBanner() {
  const router = useRouter();

  return (
    <LinearGradient
      testID="free-user-banner"
      colors={['rgba(212, 166, 58, 0.18)', 'rgba(12, 32, 70, 0.6)', 'rgba(0, 8, 20, 0.85)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.kicker}>Guest Explorer Access</Text>
      <Text style={styles.title}>Your journey starts here</Text>
      <Text style={styles.text}>
        You&apos;re exploring Red Planet Resorts as a guest. Enjoy mission
        updates, space history, news and the Mars community. Scan your ticket
        to unlock the full Mission Control Hub:
      </Text>

      {PERKS.map((perk) => (
        <View key={perk.text} style={styles.perk}>
          <Ionicons name={perk.icon} size={16} color="#F6D78B" />
          <Text style={styles.perkText}>{perk.text}</Text>
          <Ionicons name="lock-closed" size={12} color="rgba(246, 215, 139, 0.7)" />
        </View>
      ))}

      <View style={styles.buttons}>
        <GoldButton
          testID="free-scan-ticket"
          title="Scan Ticket"
          onPress={() => router.push('/scanner')}
          style={styles.button}
        />
        <GoldButton
          title="Buy Ticket"
          variant="blue"
          onPress={() => Linking.openURL(BUY_TICKET_URL)}
          style={styles.button}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(246, 215, 139, 0.45)',
    padding: 18,
    marginBottom: 20,
  },
  kicker: {
    color: '#F6D78B',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 12,
  },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  perkText: { flex: 1, color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 11 },
  buttons: { gap: 10, marginTop: 14 },
  button: {},
});
