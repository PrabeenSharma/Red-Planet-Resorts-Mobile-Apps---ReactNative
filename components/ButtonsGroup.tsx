import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isTicketOnlyRoute } from '@/constants/config';
import useTicketAccess from '@/hooks/useTicketAccess';

const ROWS: { route: string; label: string }[][] = [
  [
    { route: '/dashboard/DistanceProgressIndicator', label: 'Distance & Progress Indicators' },
    { route: '/dashboard/EnvironmentalData', label: 'Environmental Data' },
  ],
  [
    { route: '/dashboard/CommunicationMetrics', label: 'Communication Metrics' },
    { route: '/dashboard/ShipsTracker', label: 'Ship Tracker' },
  ],
  [
    { route: '/dashboard/WeeklyScheduleSnapshot', label: 'Weekly Schedule Snapshot' },
    { route: '/dashboard/SolarData', label: 'Solar Data Graph' },
  ],
];

export default function ButtonsGroup() {
  const router = useRouter();
  const pathname = usePathname(); 
  const { hasTicket } = useTicketAccess();

  const isActive = (route: string) => pathname === route;

  const getColors = (route: string) =>
    isActive(route)
      ? ['rgba(12, 32, 70, 1)', 'rgba(0, 79, 153, 1)'] 
      : [
          'rgba(24,58,86,0.2)',
          'rgba(63,125,139,0.2)',
          'rgba(24,58,86,0.2)',
        ];

  return (
    <View>
      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map(({ route, label }) => {
            const locked = hasTicket === false && isTicketOnlyRoute(route);

            return (
              <View key={route} style={styles.box}>
                <Pressable
                  disabled={locked}
                  accessibilityState={{ disabled: locked }}
                  accessibilityHint={locked ? 'Available to ticket holders' : undefined}
                  onPress={() => router.push(route as Href)}
                  style={locked && styles.locked}
                >
                  <LinearGradient colors={getColors(route) as any}
                  start={{ x: 0.85, y: 0.15 }}
                  end={{ x: 0.15, y: 0.85 }}
                  style={styles.anchorBox}>
                    {locked && (
                      <Ionicons name="lock-closed" size={10} color="#F6D78B" style={styles.lockIcon} />
                    )}
                    <Text style={styles.text}>{label}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,},
  box: { width: '48%',},
  anchorBox: { width: '100%', height: 40, borderRadius: 40, justifyContent: 'center', alignItems: 'center',borderColor: 'rgba(101, 129, 135, 1)', borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', gap: 5,},
  text: { color: '#fff', fontFamily: 'Audiowide_400Regular',  fontSize: 10, textAlign: 'center', flexShrink: 1, },
  locked: { opacity: 0.45 },
  lockIcon: { flexShrink: 0 },
});
