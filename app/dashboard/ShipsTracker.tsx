import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import TicketRequired from '@/components/TicketRequired';
import useMissionPage from '@/hooks/useMissionPage';
import ButtonsGroup from '../../components/ButtonsGroup';
import RocketWebView from '../../components/RocketProgress';
import ShipsTracker from '../../components/ShipsTracker';

export default function MissionPage() {
  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading, isFreeUser } = useMissionPage(slugParam);

  if (isFreeUser) {
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.mainContent}>
          <ButtonsGroup />
          <TicketRequired feature="Ship Tracker" />
        </View>
      </ScrollView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = screenWidth / 3.14;

  const formatDate = (dateStr?: string, addMonth = false) => {
    if (!dateStr || dateStr.length !== 8) return '';

    const year = Number(dateStr.substring(0, 4));
    const month = Number(dateStr.substring(4, 6)) - 1;
    const day = Number(dateStr.substring(6, 8));

    const date = new Date(year, month, day);

    if (addMonth) {
      date.setMonth(date.getMonth() + 1);
    }

    const m = String(date.getMonth() + 1);
    const d = String(date.getDate());
    const y = String(date.getFullYear()).slice(-2);

    return `${m}-${d}-${y}`;
  };

  const heading = page?.acf?.ships_tracker_heading ?? '';
  const missions = page?.acf?.list_of_missions ?? [];

  // ✅ SAFE LOADING GUARD (IMPORTANT FIX)
  if (loading || !page) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#60d3f6" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.mainContent}>
        <ButtonsGroup />

        <View style={styles.pageContent}>
          <LinearGradient
            colors={['#071737', '#0C285D', '#0C285D', '#071737']}
            locations={[0.0438, 0.3991, 0.549, 0.8476]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.pageBox}
          >
            <View style={styles.mainInnerContent}>
              <LinearGradient
                colors={['#0C2046', '#004F99']}
                locations={[0.1633, 0.8162]}
                start={{ x: 0.85, y: 0.15 }}
                end={{ x: 0.15, y: 0.85 }}
                style={styles.pageInnerheading}
              >
                <Text style={styles.sectionheading}>Ships tracker</Text>
              </LinearGradient>

              <Text style={styles.contentHeadingMain}>Your Location</Text>

              <View style={{ marginBottom: 20 }}>
                <RocketWebView
                  key={`${page?.acf?.launch_date}-${page?.acf?.di_arrival_date}-${page?.mission_calculation?.distance_km}`}
                  startDate={
                    page?.acf?.launch_date
                      ? formatDate(page.acf.launch_date)
                      : ''
                  }
                  endDate={
                    page?.acf?.di_arrival_date
                      ? formatDate(page.acf.di_arrival_date)
                      : ''
                  }
                  distance={
                    page?.mission_calculation?.distance_km ||
                    '214386792'
                  }
                  mission_status={
                    page?.acf?.mission_status || 'default'
                  }
                   template={page?.template}
                />
              </View>

              <ShipsTracker heading={heading} missions={missions} />
            </View>

            <Image
              source={require('../../assets/images/solarTrackerBg.png')}
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height:'auto',
                aspectRatio: 3.14,
              }}
              resizeMode="contain"
            />

            <View style={{ height: imageHeight }} />
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContent: {  paddingHorizontal: 10,    paddingVertical: 17,    alignSelf:'center',    width:'100%',  },
  pageContent:{ marginTop:20,  paddingHorizontal: 10, },
  pageBox:{ padding:0, borderRadius:20, borderColor: 'rgba(101, 129, 135, 1)' , borderWidth:0.5,  overflow:'hidden', paddingBottom:0,},
  mainInnerContent:{ paddingHorizontal:17, paddingBottom:60, paddingTop:17,},
  pageInnerheading:{ textAlign:'center', paddingHorizontal:15, paddingVertical:10, color:'#CCF6FF', fontSize:13, fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase', borderRadius:10, borderWidth:0.5, borderColor:'rgba(101, 129, 135, 1)', boxShadow: '0px 4px 9.6px rgba(0,0,0,0.2)', marginBottom:25,},
  sectionheading:{  fontSize: 13, textAlign:'center', lineHeight: 20,  color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase', },
  contentHeading:{  fontSize: 11, textAlign:'center', lineHeight: 20, color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase', marginBottom:10,},
  contentHeadingMain:{  fontSize: 20, textAlign:'center', lineHeight: 22, color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular', marginBottom:20,},
  temLocationHeading:{fontSize: 11, textAlign:'center', lineHeight: 14, color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular', marginBottom:10, fontWeight:400, textTransform:'uppercase'},
  temBox:{ borderColor:'#658187' , borderWidth:1, borderRadius:10, paddingVertical:15, paddingHorizontal:30, marginBottom:15, marginTop:10,},

  shipTrackerSection:{ marginTop:20,},
  shipTrackBox:{ backgroundColor:'rgba(217,217,217,0.12)', padding:15, borderRadius:6, marginBottom:13,}


});