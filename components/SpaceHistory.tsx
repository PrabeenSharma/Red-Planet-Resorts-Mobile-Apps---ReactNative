import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

type SpaceHistoryEvent = {
  date: string;
  description: string;
};

const SpaceHistory = () => {
  const [events, setEvents] = useState<SpaceHistoryEvent[]>([]);

  useEffect(() => {
  const today = new Date();

  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  console.log('Device Date:', today.toString());

  fetch(
    'https://trip.redplanetresorts.com/wp-json/rpr/v1/space-history'
  )
    .then(res => {
      console.log('API Status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      return res.json();
    })
    .then((data: SpaceHistoryEvent[]) => {
      console.log('Total Events:', data.length);

      const todaysEvents = data.filter((event: SpaceHistoryEvent) => {
        if (!event.date) return false;

        const match = event.date.match(
          /^([A-Za-z]+)\s+(\d+),\s*(\d{4})$/
        );

        if (!match) return false;

        const eventMonth = new Date(
          `${match[1]} 1, 2000`
        ).getMonth();

        const eventDate = parseInt(match[2], 10);

        return (
          eventMonth === todayMonth &&
          eventDate === todayDate
        );
      });

      console.log('Matched Events:', todaysEvents);

      setEvents(todaysEvents);
    })
    .catch(err => {
      console.log('Space History Error:', err);
    });
}, []);

  return (
    <View style={{ paddingHorizontal: 17, paddingBottom: 17 }}>
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
        {events.length > 0 ? (
          events.map((event, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.date}>{event.date}</Text>
              <Text style={styles.desc}>{event.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>
            No events found for today.
          </Text>
        )}
      </LinearGradient>
    </View>
  );
};

export default SpaceHistory;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
  },
  date: {
    color: '#CCF6FF',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Audiowide_400Regular',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    color: '#CCF6FF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'Audiowide_400Regular',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 0,
  },
  noData: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Audiowide_400Regular',
    textTransform: 'uppercase',
  },
  historyBox: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(101, 129, 135, 1)',
    borderRadius: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
});