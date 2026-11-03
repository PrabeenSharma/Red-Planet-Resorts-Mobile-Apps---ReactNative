import { useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GoldButton from '@/components/GoldButton';
import { BUY_TICKET_URL } from '@/constants/config';

type Props = { feature: string };

export default function TicketRequired({ feature }: Props) {
  const router = useRouter();

  return (
    <View style={styles.box} testID="ticket-required">
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed" size={28} color="#F6D78B" />
      </View>
      <Text style={styles.title}>{feature}</Text>
      <Text style={styles.text}>
        This Mission Control module is reserved for ticket holders. Scan your
        ticket to unlock live mission data.
      </Text>
      <View style={styles.buttons}>
        <GoldButton title="Scan Ticket" onPress={() => router.push('/scanner')} />
        <GoldButton
          title="Buy Ticket"
          variant="blue"
          onPress={() => Linking.openURL(BUY_TICKET_URL)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    marginHorizontal: 10,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(246, 215, 139, 0.4)',
    backgroundColor: 'rgba(0, 8, 20, 0.8)',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(246, 215, 139, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 18,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  text: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  buttons: { alignSelf: 'stretch', gap: 12 },
});
