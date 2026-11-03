import { formatDate } from '@/utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';

import InstagramFeed from '../../components/InstagramFeed';
import SpaceHistory from '../../components/SpaceHistory';
import SpaceNews from '../../components/SpaceNews';
import SubmitStoryModal from '../../components/SubmitYoursForm';
import { WebView } from 'react-native-webview';
import YoutubePlayer from "react-native-youtube-iframe";

import { useState } from 'react';

import {
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import useMissionPage from '@/hooks/useMissionPage';

export default function MissionPage() {
  const router = useRouter();

  const [visible, setVisible] = useState(false); const { width } = useWindowDimensions(); const [submitted, setSubmitted] = useState(false); const [modalVisible, setModalVisible] = useState(false);


  const { slug: slugParam } = useLocalSearchParams<{ slug?: string }>();
  const { page, loading } = useMissionPage(slugParam);

  
const rawMessage: string = page?.acf?.captains_message || '';

// Extract iframe URL
const iframeMatch = rawMessage.match(
  /<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>/i
);

const videoUrl = iframeMatch?.[1] ?? null;

// Remove iframe
let finalHtml = rawMessage.replace(
  /<iframe[\s\S]*?<\/iframe>/gi,
  ""
);

// 1. Paragraph separator: \r\n<br>\r\n
finalHtml = finalHtml.replace(
  /\r\n\s*<br\s*\/?>\s*\r\n/gi,
  "###PARAGRAPH###"
);

// 2. Remaining single newlines
finalHtml = finalHtml.replace(/\r\n/g, "<br/>");

// 3. Paragraph placeholders → <p>
finalHtml = `<p>${finalHtml
  .replace(/###PARAGRAPH###/g, "</p><p>")
}</p>`;

//console.log(finalHtml);


console.log(videoUrl);

//console.log('Final HTML:\n', finalHtml);
//console.log('Video URL:', videoUrl);

//console.log(JSON.stringify(rawMessage));


 const buttonText =
  page?.template === 'page-templates/tpl-mission.php'
    ? "Read Captain’s Message"
    : page?.template === 'page-templates/tpl-resort-update.php'
    ? 'READ WEEKLY BRIEFING'
    : page?.template === 'page-templates/tpl-mission-return.php'
    ? 'Read Captain’s Message'
    : '';    
    
  const topHeading =
  page?.template === 'page-templates/tpl-mission.php'
    ? "Captain's Log"
    : page?.template === 'page-templates/tpl-resort-update.php'
    ? 'RESORT UPDATE'
    : page?.template === 'page-templates/tpl-mission-return.php'
    ? 'Captain\'s Log'
    : '';      
  
  

const handleRefer = async () => {
  const message = `Join this mission! Buy your ticket here: https://trip.redplanetresorts.com/`;

  try {
    await Share.share(
      {
        message,
      },
      {
        dialogTitle: 'Invite your friends',
      }
    );
  } catch (error) {
    console.log(error);
  }
};


if (loading) {
  return (
    <View style={styles.loaderContainer}>
      <Image
        source={require('../../assets/images/loading.gif')}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
    </View>
  );
}

  if (!page) {
    return <Text style={{ color: '#fff' }}>No data found</Text>;
  }

  

  return (
  <ScrollView style={{ flex: 1 }}>
    <View style={{ flex: 1 }}>
      <View style={styles.mainContent}>
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

        {(() => {
        const rtn = page?.acf?.rtn_date;

        if (!rtn) return false;

        // YYYYMMDD -> YYYY-MM-DD
        const formatted =
          rtn.slice(0, 4) + '-' +
          rtn.slice(4, 6) + '-' +
          rtn.slice(6, 8);

        const rtnDate = new Date(formatted);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return rtnDate < today;
      })() && (
        <View style={styles.resupplyBox}>
          <Text style={styles.resupplyText}>
            Thanks for being part of the mission {'\n'}
          </Text>

          <Text style={styles.journeyCom}>
            Your journey is now complete.
          </Text>

          <Text style={styles.referText}>
            Book your next ticket and refer a friend to join the experience.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={styles.resupplyBtn}
              onPress={() =>
                Linking.openURL('https://trip.redplanetresorts.com/')
              }
            >
              <Text style={styles.resupplyBtnText}>Buy Ticket</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resupplyBtn}
              onPress={handleRefer}
            >
              <Text style={styles.resupplyBtnText}>Refer Friend</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

        <View
          style={{
            backgroundColor: '#000f1e',
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 17,
            height: 243,
          }}
        >
          <ImageBackground
              source={
                page?.template === 'page-templates/tpl-resort-update.php'
                  ? require('../../assets/images/resort.jpg')
                  : require('../../assets/images/captainImage.jpg')
              }
              style={{
                width: '100%',
                height: 243, 
              }}
              resizeMode="cover"
            >
            <View style={{ paddingTop: 17, paddingHorizontal: 17, position:'absolute', width:'100%', bottom:15,  }}>
              <Text style={styles.captainLogs}>{topHeading}</Text>
              <Text style={styles.informationHeading}>
                Mission Status
              </Text>
              <Text style={styles.information}>
                {page?.acf?.information}
              </Text>

              <TouchableOpacity style={{ alignSelf:'center',  }} onPress={() => setVisible(true)}>
                <LinearGradient
                  colors={['#0C2046', '#004F99']}
                  locations={[0.1624, 0.816]}
                  start={{ x: 0.85, y: 0.15 }}
                  end={{ x: 0.15, y: 0.85 }}
                  style={styles.optionGradient}
                >
                  <Text style={styles.optionText}>
                    {buttonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <View style={{ flexDirection:'row', gap:11,marginVertical:15,}}>
          <TouchableOpacity onPress={() => Linking.openURL(page?.acf?.earth_view)} style={{ flexGrow:1}}>
            <LinearGradient
              colors={['#0C2046', '#004F99']}
              locations={[0.1624, 0.816]}
              start={{ x: 0.85, y: 0.15 }}
              end={{ x: 0.15, y: 0.85 }}
              style={styles.optionGradient2}
            >
              <Image
                  source={require('../../assets/images/earthIcon.png')}
                  style={{ width: 22, height: 22 }}
                />
              <Text style={styles.optionText}>
                Earth view
              </Text>
              <Image
                  source={require('../../assets/images/arrow.png')}
                  style={{ width: 14, height: 11 }}
                />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(page?.acf?.space_map) } style={{ flexGrow:1}}>
            <LinearGradient
              colors={['#0C2046', '#004F99']}
              locations={[0.1624, 0.816]}
              start={{ x: 0.85, y: 0.15 }}
              end={{ x: 0.15, y: 0.85 }}
              style={styles.optionGradient2}
            >
              <Image
                  source={require('../../assets/images/spaceIcon.png')}
                  style={{ width: 22, height: 22 }}
                />
              <Text style={styles.optionText}>
                Space Map
              </Text>
              <Image
                  source={require('../../assets/images/arrow.png')}
                  style={{ width: 14, height: 11 }}
                />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </View>

      <LinearGradient
          colors={['#0E1F3F', 'rgba(14,42,97,0.5)', 'rgba(1,10,27,0)']}
          locations={[0, 0.22, 0.88]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ borderTopLeftRadius:10, borderTopRightRadius:10, paddingHorizontal:17, paddingVertical:25, }}
        >
          <View>
            <Text style={styles.headingCenter}>Mission Control Hub</Text>
            <View style={styles.row}>
              <View style={styles.box}>
                <Pressable style={({ pressed }) => [
                      styles.linkStyle,
                      pressed && styles.pressed
                    ]}
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
                      pressed && styles.pressed
                    ]}
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
                    <Text style={{ color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', marginBottom:0, textAlign: 'center' }}>Communication{'\n'}Metrics</Text>
                  </LinearGradient>
                </Pressable>
              </View>
              <View style={styles.box}>
                <Pressable style={({ pressed }) => [
                      styles.linkStyle,
                      pressed && styles.pressed
                    ]}
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
            <View style={styles.hsitoryContainer}>

            </View>

          </View>
      </LinearGradient>

      <View style={styles.hsitoryContainer}>
        <Text style={styles.headingCenter}>
          Space History
        </Text>
        <SpaceHistory/>
      </View>

      <View style={styles.communityContainer}>
        <Text style={styles.headingCenter}>
          Mars Community
        </Text>
      </View>
      <View style={{ paddingHorizontal:17, paddingBottom:17,}}>
      
              <LinearGradient
                  colors={[
                  'rgba(24,58,86,0.2)',
                  'rgba(63,125,139,0.2)',
                  'rgba(24,58,86,0.2)',
                  ]}
                  locations={[0.03, 0.51, 0.99]}
                  start={{ x: 0, y: 0 }}  
                  end={{ x: 1, y: 0 }}  
                  style={styles.historyBox}
              >
              
                  <Image
                    source={{ uri: page.mc_image_url  }}
                    style={{ width: '100%' , aspectRatio: 1,}} resizeMode="cover"
                  />
                  
                  <Text style={styles.communityHeading}>{ page?.acf?.mc_sub_heading }</Text>
                  <Text style={styles.communityContent}>{ page?.acf?.mc_content ?.replace(/<br\s*\/?>/gi, '\n')}</Text>

                  {submitted ? (
                  <Text style={[styles.optionText, { textAlign: 'center', marginTop: 10 }]}>
                    Thank you! Submitted successfully
                  </Text>
                ) : (
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <LinearGradient
                      colors={['#0C2046', '#004F99']}
                      locations={[0.1624, 0.816]}
                      start={{ x: 0.85, y: 0.15 }}
                      end={{ x: 0.15, y: 0.85 }}
                      style={styles.optionGradient}
                    >
                      <Text style={styles.optionText}>
                        submit yours
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                  
              </LinearGradient>
      
      
            
      </View>

      <SpaceNews/>

      <InstagramFeed/>



      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.mainHeadingBlack}>
              {page?.acf?.cap_heading || 'Title'}
            </Text>
           
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <RenderHTML
  contentWidth={width}
  source={{
    html: finalHtml ,
  }}

  systemFonts={[
    'Audiowide_400Regular',
  ]}

  baseStyle={{
    fontFamily: 'Audiowide_400Regular',
    fontSize: 12,
    lineHeight: 20,
    color: '#000',
  }}


  tagsStyles={{
    
    body: {
      fontSize: 12,
      lineHeight: 20,
      marginBottom: 10,
      color: '#000',
      fontFamily: 'Audiowide_400Regular',
    },
    p: {
      fontSize: 12,
      lineHeight: 20,
      marginBottom: 10,
      color: '#000',
      fontFamily: 'Audiowide_400Regular',
    },

    ul: {
      paddingLeft: 10,
      marginTop: 10,
      marginBottom: 10,
    },

    li: {
      fontSize: 12,
      lineHeight: 20,
      marginBottom: 10,
      color: '#000',
      fontFamily: 'Audiowide_400Regular',
    },
  }}

  
/>
{videoUrl && (
  <WebView
    source={{ uri: videoUrl, headers: {
      Referer: "https://redplanetresorts.com/",
    }, }} 
    style={{ height: 220 }}
  javaScriptEnabled
  domStorageEnabled
  allowsFullscreenVideo
  mediaPlaybackRequiresUserAction={false}
  originWhitelist={['*']}
  mixedContentMode="always"
  allowsInlineMediaPlayback
  startInLoadingState
  />
)}


            </ScrollView>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.closeBtn}
            >
              <Image
                source={require('../../assets/images/close.png')}
                style={{ width: 14, height: 14 }}
              />
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <SubmitStoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => setSubmitted(true)} 
      />
    
    </View>

    
    
  </ScrollView>


  );
}

const styles = StyleSheet.create({
  thereeColumns: {  flexDirection: 'row',  flexWrap: 'wrap',   gap: 12,  justifyContent: 'space-between', },
  mainContent: {  paddingHorizontal: 17,    paddingVertical: 17,    alignSelf:'center',    width:'100%',  },
  mainHeading: {  fontSize: 16, lineHeight: 31,  color: '#fff', fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase',  marginBottom: 17,  },
  mainHeadingBlack: { fontSize: 16, lineHeight: 31, color: '#000',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase',  marginBottom: 17,  },
  headingCenter: {  fontSize: 16,  lineHeight: 31, color: '#fff',  fontFamily: 'Audiowide_400Regular',  textTransform: 'uppercase',  marginBottom: 17, textAlign:'center', },
  topContentHolder: {  marginBottom: 8,},
  modalContent:{ fontSize: 13, lineHeight: 20,  color: '#000',  fontFamily: 'Audiowide_400Regular',   marginBottom: 0, },
  topHeading: {  fontSize: 9, color: '#fff', fontFamily: 'Audiowide_400Regular',  marginBottom: 5, textTransform: 'uppercase',},
  topContent: {  fontSize: 10,  color: 'rgba(0, 221, 241, 1)',   fontFamily: 'Audiowide_400Regular',  marginBottom: 5,  textTransform: 'uppercase',  },
  captainLogs: {  fontSize: 31,  color: '#fff',  fontFamily: 'Audiowide_400Regular',  textAlign: 'center',  marginBottom: 15, textTransform: 'uppercase', },
  information: {  color: '#fff',  fontFamily: 'Audiowide_400Regular',  fontSize: 10,  textAlign: 'center',  marginBottom: 12, lineHeight:15, textTransform: 'uppercase',},
  informationHeading: { color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 15, textAlign: 'center',  marginBottom: 15, textTransform: 'uppercase',},
  optionGradient: { height: 36,  borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal:15,},
  optionGradient2: { height: 36,  borderRadius: 6, justifyContent: 'center', alignItems: 'center', flexDirection:'row',  gap:8,},
  optionText: {  fontFamily: 'Audiowide_400Regular',  fontSize: 12,  textTransform: 'uppercase',  color: '#fff',},
  modalOverlay: {  flex: 1,  backgroundColor: 'rgba(0,0,0,0.6)',  justifyContent: 'center',  alignItems: 'center',
  },
  modalBox: {  width: '85%',  maxHeight: '80%', backgroundColor: '#fff',  padding: 20,  borderRadius: 12,  elevation: 5,},
  closeBtn: { backgroundColor: '#004F99', padding: 10, borderRadius: 8, alignItems: 'center',  position:'absolute', top:10, right:10,},
  row: {  flexDirection: 'row', justifyContent: 'space-between',  marginBottom: 12, },
  box: {  width: '48%',  alignItems: 'center', },
  linkStyle:{  width:'100%'},
  pressed: { opacity: 0.6, },
  anchorBox:{ width:'100%', height:50, borderRadius:10, justifyContent:'center', alignItems:'center', borderColor:'rgba(101, 129, 135, 1)', borderWidth:1, borderStyle:'solid', paddingHorizontal:5, },
  hsitoryContainer:{},
  communityContainer:{ marginTop:15,} ,
  historyBox:{ borderStyle:'solid', borderWidth:1, borderColor:'rgba(101, 129, 135, 1)', borderRadius:10, paddingVertical:20, paddingHorizontal:20,},
  communityHeading:{ textAlign:'center', fontFamily: 'Audiowide_400Regular', fontWeight:400,  fontSize: 16,   textTransform: 'uppercase',  color: '#00DDF1', paddingTop:20, paddingBottom:15,},
  communityContent:{ textAlign:'center', fontFamily: 'Audiowide_400Regular', fontWeight:400,  fontSize: 12,   textTransform: 'uppercase',  color: '#CCF6FF', marginBottom:25,},
  loading:{ width:109, height:16,},
  loaderContainer:{  flex: 1,  justifyContent: 'center',  alignItems: 'center',  backgroundColor: '#000',},

  resupplyBox: {
  marginTop: 20,
  padding: 32,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#00DDF1',
  backgroundColor: '#000',
},

resupplyText: {
  color: '#00ddf1',
  fontSize: 16,
  lineHeight:20,
  textAlign: 'center',
  fontFamily: 'Audiowide_400Regular',
  textTransform: 'uppercase',
  marginBottom:5,
},

referText:{ color: '#fff',
  fontSize: 11,
  lineHeight:20,
  textAlign: 'center',
  fontFamily: 'Audiowide_400Regular',
  textTransform: 'uppercase',
  marginBottom:10,},


journeyCom:{ color: '#a8d7ff',
  fontSize: 12,
  lineHeight:20,
  textAlign: 'center',
  fontFamily: 'Audiowide_400Regular',
  textTransform: 'uppercase',
  marginBottom:10,},

  
resupplyBtn: {
  flex: 1,
  height: 36,
  borderRadius: 6,
  backgroundColor: '#004F99',
  justifyContent: 'center',
  alignItems: 'center',
},

resupplyBtnText: {
  color: '#fff',
  fontSize: 11,
  fontFamily: 'Audiowide_400Regular',
  textTransform: 'uppercase',
},

});