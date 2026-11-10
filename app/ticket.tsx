import { LinearGradient } from 'expo-linear-gradient';
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
      if (r && 'fullName' in r && typeof r.fullName === 'string') {
        setFirstName(r.fullName.trim().split(/\s+/)[0]);
      }
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
          <LinearGradient
            colors={[
              'rgba(24, 58, 86, 0.2)',
              'rgba(63, 125, 139, 0.2)',
              'rgba(24, 58, 86, 0.2)',
            ]}
            locations={[0.0284, 0.5124, 0.9946]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.congratulationBox}
          >
            <Image
              source={require('../assets/images/checkMark.png')}
              style={styles.ticketImage}
              resizeMode="contain"
            />
            <Text style={styles.congratulationtext}>
              Congratulations! Your Mars visa is approved.
            </Text>
        </LinearGradient>

        {firstName ? (
          <Text style={styles.greeting}>Welcome aboard, {firstName}</Text>
        ) : null}

        <Text style={styles.title}>Do you have a ticket to scan?</Text>
       

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
  ticketImage: { width: 60, height: 60, marginBottom: 20 },
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
  congratulationBox:{ borderWidth:1, borderColor:'#658187', borderRadius:10,  width:'100%', paddingTop:30, paddingBottom:30, alignItems:'center', marginBottom:55, paddingLeft:20, paddingRight:20,},
  congratulationtext:{ fontFamily: 'Audiowide_400Regular', fontSize: 22, lineHeight:32, color:'#fff', textTransform:'uppercase', textAlign:'center', },
});
