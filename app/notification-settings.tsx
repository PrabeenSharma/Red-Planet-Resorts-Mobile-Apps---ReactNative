import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


import { registerForPushNotificationsAsync } from '@/utils/notifications';

import {
  saveFreeAccess,
  saveNotificationsEnabled,
  saveScannedSlug,
} from '@/utils/storage';

import Footer from '@/components/Footer';

export default function NotificationSettings() {

  const { slug } =
    useLocalSearchParams<{ slug?: string }>();

  const navigation = useNavigation();

  const [enabled, setEnabled] =
    useState<boolean | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [debugMessage, setDebugMessage] =
    useState('');

  const goDashboard = () => {

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'dashboard',
            params: slug ? { slug } : undefined,
          },
        ],
      }),
    );
  };

  const handleSelection = async (
    value: boolean
  ) => {

    if (saving) return;

    setEnabled(value);
    setSaving(true);

    try {

      setDebugMessage(
        'Starting notification setup...'
      );

      if (slug) {

        await saveScannedSlug(slug);
        await saveFreeAccess(false);

        setDebugMessage(
          `Slug saved: ${slug}`
        );
      }

      await saveNotificationsEnabled(value);

      if (value === true) {

        setDebugMessage(
          'Requesting notification permission...'
        );

        // GET FCM TOKEN
        const token =
          await registerForPushNotificationsAsync();

        console.log('FCM TOKEN:', token);

        if (token && slug) {

          setDebugMessage(
            `FCM TOKEN:\n\n${token}`
          );

          const response = await fetch(
            'https://trip.redplanetresorts.com/wp-json/custom/v1/save-token/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                slug,
                token,
              }),
            }
          );

          const data = await response.json();

          setDebugMessage(
            `FCM TOKEN:\n\n${token}\n\nSERVER RESPONSE:\n${JSON.stringify(
              data,
              null,
              2
            )}`
          );
        }

       

      } 

      setTimeout(() => {

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'dashboard',
                params: slug
                  ? { slug }
                  : undefined,
              },
            ],
          }),
        );

      }, 4000);

    } catch (error: any) {

      console.log(error);

      setDebugMessage(
        `ERROR:\n${
          error?.message || 'Unknown error'
        }`
      );

      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.container}>

        <LinearGradient
          colors={['#0C2046', '#004F99']}
          locations={[0.1624, 0.816]}
          start={{ x: 0.85, y: 0.15 }}
          end={{ x: 0.15, y: 0.85 }}
          style={styles.iconWrapper}
        >

          <Image
            source={require('./../assets/images/notificationIcon.png')}
            style={styles.icon}
          />

        </LinearGradient>

        <Text style={styles.description}>
          Would you like to receive mission updates?
        </Text>

        
        <View style={styles.optionsRow}>

          {/* YES */}

          <TouchableOpacity
            disabled={saving}
            style={[
              styles.option,
              enabled === true &&
                styles.optionSelected,
            ]}
            onPress={() =>
              handleSelection(true)
            }
          >

            <LinearGradient
              colors={['#0C2046', '#004F99']}
              locations={[0.1624, 0.816]}
              start={{ x: 0.85, y: 0.15 }}
              end={{ x: 0.15, y: 0.85 }}
              style={styles.optionGradient}
            >

              <Text style={styles.optionText}>
                Yes
              </Text>

            </LinearGradient>

          </TouchableOpacity>

          {/* NO */}

          <TouchableOpacity
            disabled={saving}
            style={[
              styles.optionNo,
              enabled === false &&
                styles.optionSelected,
            ]}
            onPress={() =>
              handleSelection(false)
            }
          >

            <Text style={styles.optionNoText}>
              No
            </Text>

          </TouchableOpacity>

        </View>

        {saving && (

          <View style={styles.loadingBox}>

            <ActivityIndicator
              size="small"
              color="#fff"
            />

            <Text style={styles.loadingText}>
              Saving your preference...
            </Text>

          </View>

        )}

      </View>

      <Footer />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  iconWrapper: {
    padding: 20,
    width: 60,
    height: 60,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  icon: {
    width: 30,
    height: 35,
  },

  description: {
    fontSize: 23,
    fontWeight: '400',
    textAlign: 'center',
    color: '#fff',
    lineHeight: 32,
    fontFamily: 'Audiowide_400Regular',
    padding: 25,
  },

  debugText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 18,
  },

  optionsRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 40,
  },

  option: {
    borderRadius: 6,
  },

  optionGradient: {
    height: 60,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionNo: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(126, 148, 181, 1)',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionSelected: {
    opacity: 0.8,
  },

  optionText: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 16,
    textTransform: 'uppercase',
    color: '#fff',
  },

  optionNoText: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 16,
    textTransform: 'uppercase',
    color: '#fff',
  },

  loadingBox: {
    alignItems: 'center',
    gap: 10,
  },

  loadingText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Audiowide_400Regular',
  },

});