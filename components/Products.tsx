import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL =
  'https://trip.redplanetresorts.com/wp-json/rpr/v1/theme-options';

type ProductData = {
  product_title: string;
  product_sub_title: string;
  product_price: string;
  product_description: string;
  product_image: string;
  product_url: string;
};

export default function TravelerMarketplace() {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  const decodeHtml = (value: string) =>
    value
      ?.replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>') || '';

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      if (data?.success && data?.theme_options) {
        const options = data.theme_options;

        setProduct({
          product_title: options.product_title || '',
          product_sub_title: options.product_sub_title || '',
          product_price: options.product_price || '',
          product_description: decodeHtml(
            options.product_description || ''
          ),
          product_image: options.product_image || '',
          product_url: options.product_url || '',
        });
      }
    } catch (error) {
      console.log('Marketplace API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProduct = async () => {
    if (!product?.product_url) return;

    try {
      await Linking.openURL(product.product_url);
    } catch (error) {
      console.log('Unable to open product:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#D4A63A" size="large" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.sectionLabel}>
            Mission Accessory of the Week
          </Text>
      </View>

      <View style={{ paddingHorizontal:0, paddingBottom:17,}}>
            
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

      <View style={styles.card}>
        {product.product_image ? (
          <Image
            source={{ uri: product.product_image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.productContent}>
          <Text style={styles.productName}>
            {product.product_title}
          </Text>
          <Text style={styles.productSubTitle}>
            {product.product_sub_title}
          </Text>
          

        
            <TouchableOpacity onPress={openProduct}>
              <LinearGradient
                colors={['#0C2046', '#004F99']}
                locations={[0.1624, 0.816]}
                start={{ x: 0.85, y: 0.15 }}
                end={{ x: 0.15, y: 0.85 }}
                style={styles.optionGradient}
              >
                <Text style={styles.optionText}>
                  buy now
                </Text>
              </LinearGradient>
            </TouchableOpacity>


        </View>
      </View>

        </LinearGradient>

        </View>

    </View>
  );
}

const styles = StyleSheet.create({

  optionGradient: { height: 55,  borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal:15,},
  optionText: {  fontFamily: 'Audiowide_400Regular',  fontSize: 16,  textTransform: 'uppercase',  color: '#fff',},


  container: {
    marginVertical: 18,
  },
  loader: {
    padding: 35,
    alignItems: 'center',
  },
  header: {
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    lineHeight:31,
    textTransform:'uppercase',
    marginBottom: 6,
    textAlign:'center',
    fontFamily: 'Audiowide_400Regular',

  },
  sectionTitle: {
    color: '#F6D78B',
    fontSize: 21,
    fontWeight: 'bold',
  },
  star: {
    color: '#D4A63A',
    fontSize: 27,
  },
  card: {
    
  },
  productImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#1B2530',
    marginBottom:20,
  },
  productContent: {
    paddingTop: 17,
  },
  productName: {
    color: '#16D1E6',
    fontSize: 21,
    marginBottom: 15,
    fontFamily: 'Audiowide_400Regular',
    textTransform:'uppercase',
    textAlign:'center',
  },
 productSubTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 25,
    fontFamily: 'Audiowide_400Regular',
    textTransform:'uppercase',
    textAlign:'center',
    lineHeight:17, 
  },

  
  price: {
    color: '#F6D78B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#B8BEC5',
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 18,
  },
  buyButton: {
    backgroundColor: '#D4A63A',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#101820',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonArrow: {
    color: '#101820',
    fontSize: 18,
    marginLeft: 10,
  },
    historyBox:{ borderStyle:'solid', borderWidth:1, borderColor:'rgba(101, 129, 135, 0.6)', borderRadius:10, paddingVertical:20, paddingHorizontal:20,},
});
