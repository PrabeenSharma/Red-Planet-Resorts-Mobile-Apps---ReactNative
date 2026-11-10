import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

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
        


        <Text style={styles.title}>Your Journey to Mars Begins Here</Text>


        <Text style={styles.subtitle}>
           You are now free to dream. {'\n'} Build for the Red Planet. {'\n'}Thrive on the Blue one.
        </Text>

        

        <TouchableOpacity style={{ alignSelf:'center', width:'100%', alignItems:'center',  }} onPress={() => router.push('/register')}>
            <LinearGradient
              colors={['#0C2046', '#004F99']}
              locations={[0.1624, 0.816]}
              start={{ x: 0.85, y: 0.15 }}
              end={{ x: 0.15, y: 0.85 }}
              style={styles.optionGradient}
            >
              <Text style={styles.optionText}>
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  content: { paddingHorizontal: 28, alignItems: 'center' },
  title: {  color: '#fff',  fontFamily: 'Audiowide_400Regular', fontSize: 30, lineHeight: 40, textAlign: 'center',  textTransform: 'uppercase',  marginBottom: 40, },
  subtitle: {  color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 13, lineHeight: 22, textAlign: 'center', marginBottom: 36, textTransform: 'uppercase', },
  optionGradient: { height: 55,  borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal:15, maxWidth:350, width:'100%', },
  optionText: {  fontFamily: 'Audiowide_400Regular',  fontSize: 16,  textTransform: 'uppercase',  color: '#fff',},

});
