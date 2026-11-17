import { useEffect, useState } from 'react';

import useMissionPage from '@/hooks/useMissionPage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type NewsArticle = {
  title: string;
  link: string;
  creator?: string[];
  pubDate: string;
};

export default function SpaceNews() {
  const { slug: slugParam } =
    useLocalSearchParams<{ slug?: string }>();

  const { page, loading } =
    useMissionPage(slugParam);

  const [news, setNews] = useState<
    NewsArticle[]
  >([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    const apiUrl =
      'https://newsdata.io/api/1/news?apikey=pub_61767345006b6bb28ed6dc725561c7caf864b&q=space%20news%20nasa%20mars&category=science,technology,world';

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          'Network response was not ok'
        );
      }

      const data = await response.json();

      const articles = data.results.slice(0, 6);

      setNews(articles);
    } catch (error) {
      console.log(
        'Error fetching news data:',
        error
      );
    } finally {
      setNewsLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  if (loading || newsLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!page) {
    return (
      <Text style={styles.noData}>
        No data found
      </Text>
    );
  }

  return (
    <LinearGradient
              colors={['#0E1F3F', 'rgba(14,42,97,0.5)', 'rgba(1,10,27,0)']}
              locations={[0, 0.22, 0.88]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ borderTopLeftRadius:10, borderTopRightRadius:10, paddingHorizontal:17, paddingVertical:25, marginTop:20, }}
            >
      <Text style={styles.headingCenter}>
        Space news digest
      </Text>

      <Text style={styles.description}>
        latest updates from earth and beyond, curated for our interplanetary travelers
      </Text>

      {news.map((article, index) => {
        const author =
          article.creator?.[0] || 'N/A';

        return (
          <TouchableOpacity
            key={index}
            style={styles.newsCard}
            onPress={() =>
              Linking.openURL(article.link)
            }
          >
            <Text style={styles.newsTitle}>
              {article.title}
            </Text>

            <Text style={styles.newsMeta}>
              {author} •{' '}
              {formatDate(article.pubDate)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    paddingHorizontal: 17,
    paddingVertical: 17,
    alignSelf: 'center',
    width: '100%',
  },

  headingCenter: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    textTransform: 'uppercase',
    marginBottom: 17,
    textAlign: 'center',
  },

  description: {
    color: '#A8D7FF',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 18,
    fontFamily: 'Audiowide_400Regular',
    fontSize:12,
    textTransform:'uppercase',
  },

  newsCard: {
    borderWidth: 1,
    borderColor: '#638287',
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
    backgroundColor: '#0417289e',
  },

  newsTitle: {
    color: '#ccf6ff',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
    fontFamily: 'Audiowide_400Regular',
    textTransform:'uppercase',
  },

  newsMeta: {
    color: '#7BA7C7',
    fontSize: 10,
    fontFamily: 'Audiowide_400Regular',
    textTransform:'uppercase',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noData: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Audiowide_400Regular',
    textTransform: 'uppercase',
  },
});