import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';



import useMissionPage from '@/hooks/useMissionPage';
import { formatDate } from '@/utils/date';




export default function MissionInformation() {

  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading, isFreeUser } = useMissionPage(slugParam);

  return (
      <View>
          <Text style={styles.mainHeading}>Mission information</Text>
          <View style={styles.thereeColumns}>
            <View style={{ width: '31%' }}>
              <View style={styles.topContentHolder}>
                <Text style={styles.topHeading}>Starship Sagan:</Text>
                <Text style={styles.topContent}>
                  {page?.acf?.mission_code}
                </Text>
              </View>
              <View style={styles.topContentHolder}>
                <Text style={styles.topHeading}>Mission Status:</Text>
                <Text style={styles.topContent}>
                  {page?.acf?.mission_status}
                </Text>
              </View>
            </View>

            <View style={{ width: '25%' }}>
              <View style={styles.topContentHolder}>
                <Text style={styles.topHeading}>Launch Date:</Text>
                <Text style={styles.topContent}>
                  {formatDate(page?.acf?.launch_date || '')}
                </Text>
              </View>
              <View style={styles.topContentHolder}>
                <Text style={styles.topHeading}>Return Date:</Text>
                <Text style={styles.topContent}>
                  {formatDate(page?.acf?.rtn_date || '')}
                </Text>
              </View>
            </View>

            <View style={{ width: '35%' }}>
              <View style={styles.topContentHolder}>
                <Text style={styles.topHeading}>Mission Duration:</Text>
                <Text style={styles.topContent}>
                  {page?.acf?.mission_duration}
                </Text>
              </View>
              <View style={styles.topContentHolder}>
                <Text style={styles.topHeading}>Crew Count:</Text>
                <Text style={styles.topContent}>
                  {page?.acf?.crew_count}
                </Text>
              </View>
            </View>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  mainHeading: {  fontSize: 16, lineHeight: 31,  color: '#fff', fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase',  marginBottom: 17,  },
  thereeColumns: {  flexDirection: 'row',  flexWrap: 'wrap',   gap: 12,  justifyContent: 'space-between', },
  topContentHolder: {  marginBottom: 8,},
  topHeading: {  fontSize: 9, color: '#fff', fontFamily: 'Audiowide_400Regular',  marginBottom: 5, textTransform: 'uppercase',},
  topContent: {  fontSize: 10,  color: 'rgba(0, 221, 241, 1)',   fontFamily: 'Audiowide_400Regular',  marginBottom: 5,  textTransform: 'uppercase',  },
});
