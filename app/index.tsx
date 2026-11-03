import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import GoldButton from '@/components/GoldButton';
import {
  getFreeAccess,
  getRegistration,
  getScannedSlug,
} from '@/utils/storage';
import { GlobalStyles } from '../styles/globalStyles';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const [savedSlug, registration, freeAccess] = await Promise.all([
        getScannedSlug(),
        getRegistration(),
        getFreeAccess(),
      ]);
      if (!active) return;

      if (savedSlug) {
        router.replace({ pathname: '/dashboard', params: { slug: savedSlug } });
        return;
      }

      if (registration && freeAccess) {
        router.replace('/dashboard');
        return;
      }

      if (registration) {
        router.replace('/ticket');
        return;
      }

      setChecking(false);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <View style={[GlobalStyles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#F6D78B" />
      </View>
    );
  }

  const planetSize = Math.min(width * 0.45, 200);
  const contentWidth = Math.min(width, 520);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scroll}
    >
      <View style={[styles.content, { width: contentWidth }]}>
        <View style={[styles.planetGlow, { width: planetSize + 40, height: planetSize + 40, borderRadius: (planetSize + 40) / 2 }]}>
          <View style={{ width: planetSize, height: planetSize, borderRadius: planetSize / 2, overflow: 'hidden' }}>
            <Image
              source={require('../assets/images/mars.gif')}
              style={{ width: planetSize, height: planetSize }}
              resizeMode="cover"
            />
          </View>
        </View>

        <Text style={styles.kicker}>Red Planet Resorts</Text>

        <Text style={styles.title}>Welcome to{'\n'}Red Planet Resorts</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>
          Experience the way space travel was always meant to be. With the
          luxury of Red Planet Resorts.
        </Text>

        <GoldButton
          testID="get-started"
          title="Get Started"
          onPress={() => router.push('/register')}
          style={styles.cta}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  content: { paddingHorizontal: 28, alignItems: 'center' },
  planetGlow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: 'rgba(212, 166, 58, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(246, 215, 139, 0.35)',
    shadowColor: '#FF6A2B',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  kicker: {
    color: '#F6D78B',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 30,
    lineHeight: 40,
    textAlign: 'center',
  },
  divider: {
    width: 70,
    height: 2,
    backgroundColor: '#D4A63A',
    borderRadius: 2,
    marginVertical: 20,
  },
  subtitle: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
  },
  cta: { alignSelf: 'stretch' },
});
