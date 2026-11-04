import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ButtonsGroup from '../../components/ButtonsGroup';

import TicketRequired from '@/components/TicketRequired';
import useMissionPage from '@/hooks/useMissionPage';

export default function MissionPage() {

  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading, isFreeUser } = useMissionPage(slugParam);

  if (isFreeUser) {
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.mainContent}>
          <ButtonsGroup />
          <TicketRequired feature="Communication Metrics" />
        </View>
      </ScrollView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = screenWidth / 3.04;

  return (
    
    <ScrollView style={{ flex: 1 }}>
          <View style={styles.mainContent}>
            <ButtonsGroup/>
            <View style={styles.pageContent}>
              <LinearGradient
                  colors={[
                    '#071737',
                    '#0C285D',
                    '#0C285D',
                    '#071737',
                  ]}
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
                          <Text style={styles.sectionheading}>Communication Metrics</Text>
                        </LinearGradient>

                        {
  page?.template === 'page-templates/tpl-resort-update.php' ? (

    <>
      {/* ================= COMMUNICATION ITEMS ================= */}

      {
        page?.mission_communication_delay?.communication_items?.length > 0 ? (

          page.mission_communication_delay.communication_items.map(
            (item: any, index: number) => (

              <View style={styles.temBox} key={index}>

                <View style={styles.topIconHeadingHolder}>

                  <Image
                    source={require('../../assets/images/earthIcon.png')}
                    style={{ width: 28, height: 28 }}
                  />

                  <Text style={styles.topIconHeading}>
                    {item.heading}
                  </Text>

                  <Image
                    source={require('../../assets/images/satteliteIcon.png')}
                    style={{ width: 28, height: 28 }}
                  />

                </View>

                <View style={styles.communicationData}>

                  <Text style={styles.leftData}>
                    {item.total_seconds}
                  </Text>

                  <Text style={styles.leftData}>=</Text>

                  <View style={styles.dataCalculation}>

                    <Text style={styles.leftData}>
                      {item.minutes}Min
                    </Text>

                    <Text style={styles.leftData}> | </Text>

                    <Text style={styles.leftData}>
                      {item.seconds}Sec
                    </Text>

                  </View>

                </View>

              </View>
            )
          )

        ) : (
          <Text>No Data</Text>
        )
      }

      {/* ================= DISTANCE ITEM ================= */}

      {
        page?.mission_communication_delay?.distance_items?.length > 0 && (

          <View style={styles.temBox}>

            <View style={styles.topIconHeadingHolder}>

              <Image
                source={require('../../assets/images/earthIcon.png')}
                style={{ width: 28, height: 28 }}
              />

              <Text style={styles.topIconHeading}>
                {
                  page.mission_communication_delay
                    .distance_items[0]?.heading
                }
              </Text>

              <Image
                source={require('../../assets/images/satteliteIcon.png')}
                style={{ width: 28, height: 28 }}
              />

            </View>

            <View style={styles.communicationData}>

              <View style={styles.dataCalculation}>

                <Text style={styles.leftData}>
                  {
                    page.mission_communication_delay
                      .distance_items[0]?.distance_km
                  } KM
                </Text>

              </View>

            </View>

          </View>
        )
      }

    </>

  )
  
: page?.template === 'page-templates/tpl-mission-return.php' ? (

  <>
    {/* ================= MISSION RETURN TEMPLATE ================= */}

    {
      page?.communication_delay_return?.communication?.length > 0 ? (

        page.communication_delay_return.communication.map(
          (item: any, index: number) => (

            <View style={styles.temBox} key={index}>

              <View style={styles.topIconHeadingHolder}>

                <Image
                  source={require('../../assets/images/earthIcon.png')}
                  style={{ width: 28, height: 28 }}
                />

                <Text style={styles.topIconHeading}>
                  {item.heading}
                </Text>

                <Image
                  source={require('../../assets/images/satteliteIcon.png')}
                  style={{ width: 28, height: 28 }}
                />

              </View>

              <View style={styles.communicationData}>

                <Text style={styles.leftData}>
                  {item.seconds} Sec
                </Text>

                <Text style={styles.leftData}>=</Text>

                <View style={styles.dataCalculation}>

                  <Text style={styles.leftData}>
                    {item.minutes}Min
                  </Text>

                  <Text style={styles.leftData}> | </Text>

                  <Text style={styles.leftData}>
                    {item.remaining_seconds}Sec
                  </Text>

                </View>

              </View>

            </View>
          )
        )

      ) : (
        <Text>No Data</Text>
      )
    }

    {/* ================= RETURN DISTANCE ================= */}

    {
      page?.communication_delay_return?.distance?.length > 0 && (

        <View style={styles.temBox}>

          <View style={styles.topIconHeadingHolder}>

            <Image
              source={require('../../assets/images/earthIcon.png')}
              style={{ width: 28, height: 28 }}
            />

            <Text style={styles.topIconHeading}>
              {
                page.communication_delay_return
                  .distance[0]?.heading
              }
            </Text>

            <Image
              source={require('../../assets/images/satteliteIcon.png')}
              style={{ width: 28, height: 28 }}
            />

          </View>

          <View style={styles.communicationData}>

            <View style={styles.dataCalculation}>

              <Text style={styles.leftData}>
                {
                  page.communication_delay_return
                    .distance[0]?.distance_km
                } KM
              </Text>

            </View>

          </View>

        </View>
      )
    }

  </>

)
  
  : (

    <>
      {/* ================= OLD TEMPLATE ================= */}

      {
        page?.communication_delay?.length > 0 ? (

          page.communication_delay.map(
            (item: any, index: number) => (

              <View style={styles.temBox} key={index}>

                <View style={styles.topIconHeadingHolder}>

                  <Image
                    source={require('../../assets/images/earthIcon.png')}
                    style={{ width: 28, height: 28 }}
                  />

                  <Text style={styles.topIconHeading}>
                    {item.heading}
                  </Text>

                  <Image
                    source={require('../../assets/images/satteliteIcon.png')}
                    style={{ width: 28, height: 28 }}
                  />

                </View>

                <View style={styles.communicationData}>

                  <Text style={styles.leftData}>
                    {item.seconds}
                  </Text>

                  <Text style={styles.leftData}>=</Text>

                  <View style={styles.dataCalculation}>

                    <Text style={styles.leftData}>
                      {item.minutes}Min
                    </Text>

                    <Text style={styles.leftData}> | </Text>

                    <Text style={styles.leftData}>
                      {item.remaining_seconds}Sec
                    </Text>

                  </View>

                </View>

              </View>
            )
          )

        ) : (
          <Text>No Data</Text>
        )
      }

      {/* ================= OLD DISTANCE ================= */}

      <View style={styles.temBox}>

        <View style={styles.topIconHeadingHolder}>

          <Image
            source={require('../../assets/images/earthIcon.png')}
            style={{ width: 28, height: 28 }}
          />

          <Text style={styles.topIconHeading}>
            {page?.custom_distance?.distance_row_1}
          </Text>

          <Image
            source={require('../../assets/images/satteliteIcon.png')}
            style={{ width: 28, height: 28 }}
          />

        </View>

        <View style={styles.communicationData}>

          <View style={styles.dataCalculation}>

            <Text style={styles.leftData}>
              {page?.mission_calculation?.distance_km} KM
            </Text>

          </View>

        </View>

      </View>

    </>

  )
}

                        

                    </View>
                  <Image
                    source={require('../../assets/images/communicationMatrixBg.png')}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: '100%',
                      height:'auto',
                      aspectRatio: 3.04,
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
  mainInnerContent:{ paddingHorizontal:17, paddingBottom:20, paddingTop:17,},
  pageInnerheading:{ textAlign:'center', paddingHorizontal:15, paddingVertical:10, color:'#CCF6FF', fontSize:13, fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase', borderRadius:10, borderWidth:0.5, borderColor:'rgba(101, 129, 135, 1)',  boxShadow: '0px 4px 9.6px rgba(0,0,0,0.2)', marginBottom:25,},
  sectionheading:{  fontSize: 13, textAlign:'center', lineHeight: 20,  color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase', },
  contentHeading:{  fontSize: 11, textAlign:'center', lineHeight: 20, color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase', marginBottom:10,},
  contentHeadingMain:{  fontSize: 20, textAlign:'center', lineHeight: 22, color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular', marginBottom:10,},
  temLocationHeading:{fontSize: 11, textAlign:'center', lineHeight: 14, color: '#CCF6FF',  fontFamily: 'Audiowide_400Regular', marginBottom:10, fontWeight:400, textTransform:'uppercase'},
  temBox:{ borderColor:'#658187' , borderWidth:1, borderRadius:10, paddingHorizontal:15, marginBottom:15, marginTop:10, paddingBottom:22, paddingTop:15,},
  topIconHeadingHolder:{ justifyContent:'space-between', alignItems:'center', flexDirection:'row', marginBottom:12,},
  topIconHeading:{ color:'#CCF6FF',  fontFamily: 'Audiowide_400Regular', fontSize:13, fontWeight:400, textTransform:'uppercase', },
  communicationData:{ flexDirection:'row', justifyContent:'center', gap:10, alignItems:'center',},
  leftData:{ color:'#CCF6FF',  fontFamily: 'Audiowide_400Regular', fontSize:16, fontWeight:400, textTransform:'uppercase',},
  dataCalculation:{ flexDirection:'row', gap:3, backgroundColor:'rgba(0,221,241,0.26)', paddingHorizontal:7, paddingVertical:5, borderRadius:4}

});