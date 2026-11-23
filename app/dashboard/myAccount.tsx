import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';


import GoldButton from '@/components/GoldButton';
import useMissionPage from '@/hooks/useMissionPage';
import { saveFreeAccess } from '@/utils/storage';
import { useState } from 'react';

export default function myAccount() {

  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading } = useMissionPage(slugParam);

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = screenWidth / 3.33;

  const [imageLoading, setImageLoading] = useState(true);

const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);


  const updateaccount = async () => {
    if (busy) return;
    setBusy(true);
    await saveFreeAccess(false);
    setBusy(false);
    router.push('/dashboard/account-update');
  };

  const handleNo = async () => {
    if (busy) return;
    setBusy(true);
    await saveFreeAccess(true);
    router.replace('/notification-settings');
  };

  const commissionYourRover = async () => {
    if (busy) return;
    setBusy(true);
    await saveFreeAccess(true);
    router.replace('/dashboard/commissionYourRover');
  };

  const scanNewTicket = async () => {
    if (busy) return;
    setBusy(true);
    await saveFreeAccess(true);
    router.replace('/scanner');
  };



  return (
    
    <ScrollView style={{ flex: 1 }}>
          <View style={styles.mainContent}>
              <View style={styles.buttons}>
                  <GoldButton
                    testID="update-account"
                    title="Update Account info"
                    onPress={updateaccount}
                    disabled={busy}
                  />
                  <GoldButton
                    testID="commission-your-rover"
                    title="Commission your Rover"
                    variant="transparent"
                    onPress={commissionYourRover}
                    disabled={busy}
                  />
              <GoldButton
                    testID="ticket-no"
                    title="Notification settings"
                    variant="transparent"
                    onPress={handleNo}
                    disabled={busy}
                  />
              <GoldButton
                    testID="scan-a-new-ticket"
                    title="Scan a new ticket"
                    variant="transparent"
                    onPress={scanNewTicket}
                    disabled={busy}
                  />
                </View>
          </View>
    </ScrollView>  

          
  );
}

const styles = StyleSheet.create({
  mainContent: {  paddingHorizontal: 20,    paddingVertical: 50,    alignSelf:'center',    width:'100%',  },
  buttons: {  gap: 16 , justifyContent: 'center', alignItems: 'center', marginBottom: 24, width:'100%' },
});