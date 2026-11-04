import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GoldButton from '@/components/GoldButton';
import { BUY_TICKET_URL } from '@/constants/config';
import { getRegistration, saveFreeAccess } from '@/utils/storage';

export default function TicketQuestionScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getRegistration().then((r) => {
      if (r?.fullName) setFirstName(r.fullName.trim().split(/\s+/)[0]);
    });
  }, []);

  const handleYes = async () => {
    if (busy) return;
    setBusy(true);
    await saveFreeAccess(false);
    setBusy(false);
    router.push('/scanner');
  };

  const handleNo = async () => {
    if (busy) return;
    setBusy(true);
    await saveFreeAccess(true);
    router.replace('/dashboard');
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/ticket.png')}
          style={styles.ticketImage}
          resizeMode="contain"
        />

        {firstName ? (
          <Text style={styles.greeting}>Welcome aboard, {firstName}</Text>
        ) : null}

        <Text style={styles.title}>Do you have a ticket?</Text>
        <Text style={styles.subtitle}>
          Ticket holders unlock the full Mission Control Hub. No ticket? You can
          still explore the dashboard as a guest.
        </Text>

        <View style={styles.buttons}>
          <GoldButton
            testID="ticket-yes"
            title="Yes"
            onPress={handleYes}
            disabled={busy}
          />
          <GoldButton
            testID="ticket-no"
            title="No"
            variant="blue"
            onPress={handleNo}
            disabled={busy}
          />
        </View>

        <Pressable
          onPress={() => Linking.openURL(BUY_TICKET_URL)}
          style={({ pressed }) => [styles.buyLink, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.buyText}>Want a ticket? Plan your trip</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  content: { width: '100%', maxWidth: 520, paddingHorizontal: 28, alignItems: 'center' },
  ticketImage: { width: 161, height: 105, marginBottom: 24 },
  greeting: {
    color: '#F6D78B',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttons: { alignSelf: 'stretch', gap: 16 },
  buyLink: { marginTop: 24, padding: 8 },
  buyText: {
    color: '#00DDF1',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 12,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
});
