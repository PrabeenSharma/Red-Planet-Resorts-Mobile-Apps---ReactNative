import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';


import useMissionPage from '@/hooks/useMissionPage';
import { useState } from 'react';

export default function commissionYourRover() {

  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading } = useMissionPage(slugParam);

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = screenWidth / 3.33;

  const [imageLoading, setImageLoading] = useState(true);

const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);





  return (
    
    <ScrollView style={{ flex: 1 }}>
          <View style={styles.mainContent}>
             <Text style={{ color:'#fff',  }}>Commission Your Rover</Text>
          </View>
    </ScrollView>  

          
  );
}

const styles = StyleSheet.create({
  mainContent: {  paddingHorizontal: 20,    paddingVertical: 50,    alignSelf:'center',    width:'100%',  },
  buttons: {  gap: 16 , justifyContent: 'center', alignItems: 'center', marginBottom: 24, width:'100%' },
});