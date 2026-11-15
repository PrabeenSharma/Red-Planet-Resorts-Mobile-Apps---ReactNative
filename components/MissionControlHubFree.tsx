import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import useTicketAccess from '@/hooks/useTicketAccess';

import { isTicketOnlyRoute } from '@/constants/config';

import useMissionPage from '@/hooks/useMissionPage';

const ROWS: { route: string; label: string }[][] = [
  [
    { route: '/dashboard/DistanceProgressIndicator', label: 'Distance & Progress Indicators' },
    { route: '/dashboard/EnvironmentalData', label: 'Environmental Data' },
  ],
  [
    { route: '/dashboard/CommunicationMetrics', label: 'Communication Metrics' },
    { route: '/dashboard/ShipsTracker', label: 'Ship Tracker' },
  ],
  [
    { route: '/dashboard/WeeklyScheduleSnapshot', label: 'Weekly Schedule Snapshot' },
    { route: '/dashboard/SolarData', label: 'Solar Data Graph' },
  ],
];



export default function MissionControlHubFree() {

  const isLocked = (route: string) => isFreeUser && isTicketOnlyRoute(route);
  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading, isFreeUser } = useMissionPage(slugParam);

  const router = useRouter();
  const pathname = usePathname(); 
  const { hasTicket } = useTicketAccess();

  const isActive = (route: string) => pathname === route;

  const getColors = (route: string) =>
    isActive(route)
      ? ['rgba(12, 32, 70, 1)', 'rgba(0, 79, 153, 1)'] 
      : [
          'rgba(24,58,86,0.2)',
          'rgba(63,125,139,0.2)',
          'rgba(24,58,86,0.2)',
        ];

  return (
     <View>
          <Text style={styles.headingCenter}>Mission Control Hub</Text>
          <View style={styles.row}>
            <View style={styles.box}>
              <Pressable style={({ pressed }) => [
                    styles.linkStyle,
                    pressed && styles.pressed,
                    isLocked('/dashboard/DistanceProgressIndicator') && styles.locked,
                  ]}
                  disabled={isLocked('/dashboard/DistanceProgressIndicator')}
                  accessibilityState={{ disabled: isLocked('/dashboard/DistanceProgressIndicator') }}
                  onPress={() => router.push('/dashboard/DistanceProgressIndicator')}>
                  <LinearGradient
                    colors={[
                      'rgba(24,58,86,0.2)',
                      'rgba(63,125,139,0.2)',
                      'rgba(24,58,86,0.2)',
                    ]}
                    locations={[0.03, 0.51, 0.99]}
                    start={{ x: 0, y: 0 }}  
                    end={{ x: 1, y: 0 }}  
                    style={styles.anchorBox}
                  >
                  {isLocked('/dashboard/DistanceProgressIndicator') }
                  <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Distance & Progress{'\n'}Indicators</Text>
                </LinearGradient>
              </Pressable>
            </View>
            <View style={styles.box}>
              <Pressable style={({ pressed }) => [
                    styles.linkStyle,
                    pressed && styles.pressed
                  ]}
                  onPress={() => router.push('/dashboard/EnvironmentalData')}>
                  <LinearGradient
                    colors={[
                      'rgba(24,58,86,0.2)',
                      'rgba(63,125,139,0.2)',
                      'rgba(24,58,86,0.2)',
                    ]}
                    locations={[0.03, 0.51, 0.99]}
                    start={{ x: 0, y: 0 }}  
                    end={{ x: 1, y: 0 }}  
                    style={styles.anchorBox}
                  >
                  <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Environmental{'\n'}Data</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.box}>
              <Pressable style={({ pressed }) => [
                    styles.linkStyle,
                    pressed && styles.pressed,
                    isLocked('/dashboard/CommunicationMetrics') && styles.locked,
                  ]}
                  disabled={isLocked('/dashboard/CommunicationMetrics')}
                  accessibilityState={{ disabled: isLocked('/dashboard/CommunicationMetrics') }}
                  onPress={() => router.push('/dashboard/CommunicationMetrics')}>
                  <LinearGradient
                    colors={[
                      'rgba(24,58,86,0.2)',
                      'rgba(63,125,139,0.2)',
                      'rgba(24,58,86,0.2)',
                    ]}
                    locations={[0.03, 0.51, 0.99]}
                    start={{ x: 0, y: 0 }}  
                    end={{ x: 1, y: 0 }}  
                    style={styles.anchorBox}
                  >
                  {isLocked('/dashboard/CommunicationMetrics')}
                  <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Communication{'\n'}Metrics</Text>
                </LinearGradient>
              </Pressable>
            </View>
            <View style={styles.box}>
              <Pressable style={({ pressed }) => [
                    styles.linkStyle,
                    pressed && styles.pressed,
                    isLocked('/dashboard/ShipsTracker') && styles.locked,
                  ]}
                  disabled={isLocked('/dashboard/ShipsTracker')}
                  accessibilityState={{ disabled: isLocked('/dashboard/ShipsTracker') }}
                  onPress={() => router.push('/dashboard/ShipsTracker')}>
                  <LinearGradient
                    colors={[
                      'rgba(24,58,86,0.2)',
                      'rgba(63,125,139,0.2)',
                      'rgba(24,58,86,0.2)',
                    ]}
                    locations={[0.03, 0.51, 0.99]}
                    start={{ x: 0, y: 0 }}  
                    end={{ x: 1, y: 0 }}  
                    style={styles.anchorBox}
                  >
                  {isLocked('/dashboard/ShipsTracker')}
                  <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Ship{'\n'}Tracker</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.box}>
              <Pressable style={({ pressed }) => [
                    styles.linkStyle,
                    pressed && styles.pressed
                  ]}
                  onPress={() => router.push('/dashboard/WeeklyScheduleSnapshot')}>
                  <LinearGradient
                    colors={[
                      'rgba(24,58,86,0.2)',
                      'rgba(63,125,139,0.2)',
                      'rgba(24,58,86,0.2)',
                    ]}
                    locations={[0.03, 0.51, 0.99]}
                    start={{ x: 0, y: 0 }}  
                    end={{ x: 1, y: 0 }}  
                    style={styles.anchorBox}
                  >
                  <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Weekly Schedule{'\n'}Snapshot</Text>
                </LinearGradient>
              </Pressable>
            </View>
            <View style={styles.box}>
              <Pressable style={({ pressed }) => [
                    styles.linkStyle,
                    pressed && styles.pressed
                  ]}
                  onPress={() => router.push('/dashboard/SolarData')}>
                  <LinearGradient
                    colors={[
                      'rgba(24,58,86,0.2)',
                      'rgba(63,125,139,0.2)',
                      'rgba(24,58,86,0.2)',
                    ]}
                    locations={[0.03, 0.51, 0.99]}
                    start={{ x: 0, y: 0 }}  
                    end={{ x: 1, y: 0 }}  
                    style={styles.anchorBox}
                  >
                  <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Solar Data{'\n'}Graph</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
          


            

        </View>
  );
}

const styles = StyleSheet.create({
  headingCenter: {  fontSize: 16,  lineHeight: 31, color: '#fff',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase',  marginBottom: 17, textAlign:'center', },
  row: {  flexDirection: 'row', justifyContent: 'space-between',  marginBottom: 12, },
  box: {  width: '48%',  alignItems: 'center', },
  linkStyle:{  width:'100%'},
  locked: { opacity: 0.45 },
  lockIcon: { position: 'absolute', top: 6, right: 10 },
  pressed: { opacity: 0.6, },
  anchorBox:{ width:'100%', height:50, borderRadius:10, justifyContent:'center', alignItems:'center', borderColor:'rgba(101, 129, 135, 1)', borderWidth:1, borderStyle:'solid', paddingHorizontal:5, },
  anchorBoxCaptainLog:{ width:'100%', height:67, borderRadius:10, justifyContent:'center', alignItems:'center', borderColor:'#658187', borderWidth:1, borderStyle:'solid', paddingHorizontal:5, opacity:0.5 , marginBottom:30, fontSize:19,},
  linkStyleCaptainLog:{  width:'auto', flexDirection:'row', alignItems:'center', gap:14, height:67, paddingHorizontal:30, justifyContent:'center', marginTop:30, marginBottom:20},
  CaptainLogBtn:{ alignItems:'center', gap:14, flexDirection:'row' , height:67,}
});
