// components/Header.tsx

import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';

import {
  clearAllScanData,
  getNotificationsEnabled,
  getScannedSlug,
  saveNotificationsEnabled,
} from '@/utils/storage';

export default function Header() {

  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [notificationsOn, setNotificationsOn] =
    useState(false);

  const isDashboardRoot =
    pathname === '/dashboard';

  const isDashboardSubPage =
    pathname.startsWith('/dashboard') &&
    pathname !== '/dashboard';

  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATION STATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      !isDashboardRoot &&
      !isDashboardSubPage
    ) {
      return;
    }

    let active = true;

    (async () => {

      const value =
        await getNotificationsEnabled();

      if (active) {
        setNotificationsOn(value === true);
      }

    })();

    return () => {
      active = false;
    };

  }, [pathname, menuOpen]);

  /*
  |--------------------------------------------------------------------------
  | GET EXPO PUSH TOKEN
  |--------------------------------------------------------------------------
  */

  const getExpoPushToken = async () => {

    try {

      const tokenData =
        await Notifications.getExpoPushTokenAsync({

          projectId:
            '04cfa4ab-7aff-4884-bf4e-8cdac57c4a0f',

        });

      return tokenData?.data || '';

    } catch (error) {

      console.log(
        'EXPO PUSH TOKEN ERROR:',
        error
      );

      return '';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE NOTIFICATION
  |--------------------------------------------------------------------------
  */

  const handleToggle = async (
    next: boolean
  ) => {

    try {

      /*
      |--------------------------------------------------------------------------
      | UPDATE UI + STORAGE
      |--------------------------------------------------------------------------
      */

      setNotificationsOn(next);

      await saveNotificationsEnabled(next);

      /*
      |--------------------------------------------------------------------------
      | GET CURRENT USER SLUG
      |--------------------------------------------------------------------------
      */

      const slug =
        await getScannedSlug();

      if (!slug) {

        console.log('Slug not found');

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | ASK PERMISSION
      |--------------------------------------------------------------------------
      */

      const {
        status: existingStatus
      } =
        await Notifications.getPermissionsAsync();

      let finalStatus =
        existingStatus;

      if (
        existingStatus !== 'granted'
      ) {

        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (
        finalStatus !== 'granted'
      ) {

        console.log(
          'Notification permission denied'
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | GET EXPO PUSH TOKEN
      |--------------------------------------------------------------------------
      */

      const token =
        await getExpoPushToken();

      /*
      |--------------------------------------------------------------------------
      | TOKEN NOT FOUND
      |--------------------------------------------------------------------------
      */

      if (!token) {

        console.log(
          'Expo push token not found'
        );

        return;
      }

      console.log(
        'EXPO PUSH TOKEN:',
        token
      );

      /*
      |--------------------------------------------------------------------------
      | NOTIFICATION ON
      |--------------------------------------------------------------------------
      */

      if (next) {

        /*
        |--------------------------------------------------------------------------
        | SAVE TOKEN TO WORDPRESS
        |--------------------------------------------------------------------------
        */

        const response =
          await fetch(
            'https://trip.redplanetresorts.com/wp-json/custom/v1/save-token/',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                slug,
                token,
                remove: false,

              }),
            }
          );

        const result =
          await response.json();

        console.log(
          'SAVE TOKEN RESPONSE:',
          result
        );
      }

      /*
      |--------------------------------------------------------------------------
      | NOTIFICATION OFF
      |--------------------------------------------------------------------------
      */

      else {

        /*
        |--------------------------------------------------------------------------
        | CLEAR ALL LOCAL NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        await Notifications.dismissAllNotificationsAsync();

        /*
        |--------------------------------------------------------------------------
        | REMOVE TOKEN FROM SERVER
        |--------------------------------------------------------------------------
        */

        const response =
          await fetch(
            'https://trip.redplanetresorts.com/wp-json/custom/v1/save-token/',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                slug,
                token,
                remove: true,

              }),
            }
          );

        const result =
          await response.json();

        console.log(
          'REMOVE TOKEN RESPONSE:',
          result
        );
      }

    } catch (error) {

      console.log(
        'Notification Toggle Error:',
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NEW SCAN
  |--------------------------------------------------------------------------
  */

  const handleNewScan = async () => {

    try {

      setMenuOpen(false);

      /*
      |--------------------------------------------------------------------------
      | GET CURRENT SLUG
      |--------------------------------------------------------------------------
      */

      const slug =
        await getScannedSlug();

      // Guest users have nothing to clear.
      if (!slug) {
        router.push('/scanner');
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | GET EXPO PUSH TOKEN
      |--------------------------------------------------------------------------
      */

      const token =
        await getExpoPushToken();

      /*
      |--------------------------------------------------------------------------
      | REMOVE TOKEN FROM SERVER
      |--------------------------------------------------------------------------
      */

      if (slug && token) {

        await fetch(
          'https://trip.redplanetresorts.com/wp-json/custom/v1/save-token/',
          {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({

              slug,
              token,
              remove: true,

            }),
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CLEAR LOCAL STORAGE
      |--------------------------------------------------------------------------
      */

      await clearAllScanData();

      /*
      |--------------------------------------------------------------------------
      | CLEAR LOCAL NOTIFICATIONS
      |--------------------------------------------------------------------------
      */

      await Notifications.dismissAllNotificationsAsync();

      /*
      |--------------------------------------------------------------------------
      | RELOAD APP
      |--------------------------------------------------------------------------
      */

      await Updates.reloadAsync();

    } catch (error) {

      console.log(
        'NEW SCAN ERROR:',
        error
      );
    }
  };

  return (

    <View style={styles.container}>

      {isDashboardSubPage ? (

        <TouchableOpacity
          onPress={() =>
            router.replace('/dashboard')
          }
          style={styles.backButton}
        >

          <View style={styles.backButtonArrow}>

            <Image
              source={require('./../assets/images/back.png')}
              style={{
                width: 20,
                height: 20,
              }}
            />

          </View>

        </TouchableOpacity>

      ) : (

        <View style={styles.leftPlaceholder} />

      )}

      <View style={styles.logo}>

        <Image
          source={require('./../assets/images/Logo.png')}
          style={styles.logo}
        />

      </View>

      {pathname.startsWith('/dashboard') ? (

        <TouchableOpacity
          onPress={() =>
            setMenuOpen(true)
          }
          style={styles.menuButton}
        >

          <Image
            source={require('./../assets/images/settingIcon.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />

        </TouchableOpacity>

      ) : (

        <View
          style={
            styles.menuButtonPlaceholder
          }
        />

      )}

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMenuOpen(false)
        }
      >

        <Pressable
          style={styles.backdrop}
          onPress={() =>
            setMenuOpen(false)
          }
        >

          <Pressable
            style={styles.menuSheet}
            onPress={() => {}}
          >

            <View
              style={[
                styles.menuItem,
                styles.menuItemRow,
              ]}
            >

              <Image
                source={require('./../assets/images/topNotificationIcon.png')}
                style={{
                  width: 14,
                  height: 17,
                  flexShrink: 0,
                }}
              />

              <Text
                style={styles.menuItemText}
              >
                Notifications
              </Text>

              <Switch
                style={
                  styles.swicthFunction
                }
                value={notificationsOn}
                onValueChange={
                  handleToggle
                }
                trackColor={{
                  false: '#ccc',
                  true: '#CCF6FF',
                }}
                thumbColor={
                  notificationsOn
                    ? '#fff'
                    : '#f4f3f4'
                }
              />

            </View>

            <View
              style={styles.menuDivider}
            />

            <TouchableOpacity
              style={styles.menuItemScan}
              onPress={handleNewScan}
            >

              <Image
                source={require('./../assets/images/scanIcon.png')}
                style={{
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                }}
              />

              <Text
                style={styles.menuItemText}
              >
                Scan a new ticket
              </Text>

            </TouchableOpacity>

          </Pressable>

        </Pressable>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {

    paddingHorizontal: 15,
    paddingVertical: 15,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  logo: {

    width: 252,
    height: 51,

    alignSelf: 'center',
  },

  backButton: {

    position: 'absolute',

    left: 15,
    top: 30,
  },

  backText: {

    fontSize: 22,

    color: '#fff',

    fontWeight: '600',
  },

  leftPlaceholder: {
    width: 0,
  },

  menuButton: {

    position: 'absolute',

    right: 15,
    top: 30,
  },

  menuButtonPlaceholder: {},

  backdrop: {

    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.3)',

    alignItems: 'flex-end',

    paddingTop: 120,
    paddingRight: 15,
  },

  menuSheet: {

    minWidth: 190,

    backgroundColor: '#193553',

    borderRadius: 6,

    paddingHorizontal: 6,

    elevation: 6,
  },

  menuItem: {

    paddingVertical: 12,

    paddingHorizontal: 10,
  },

  menuItemRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,
  },

  menuItemScan: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

    paddingVertical: 12,

    paddingHorizontal: 12,
  },

  menuItemText: {

    fontSize: 12,

    color: '#fff',

    fontFamily:
      'Audiowide_400Regular',
  },

  menuDivider: {

    height: 1,

    backgroundColor: '#658187',

    marginHorizontal: 0,
  },

  backButtonArrow: {},

  swicthFunction: {
    marginLeft: 'auto',
  },

});