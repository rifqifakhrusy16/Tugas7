import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.203.74:5000/api/game-cartridges';
const windowWidth = Dimensions.get('window').width;

const SAMPLE_DATA = [
  {
    _id: '1',
    name: 'Final Fantasy X',
    type: 'RPG',
    price: 29.99,
    rating: 4.8,
    photo: 'https://via.placeholder.com/300x400',
    description: 'Epic RPG featuring Tidus and Yuna in the world of Spira'
  },
  // Tambahkan data sampel lainnya di sini
];

export default function BerandaScreen({ navigation }) {
  const [gameCartridges, setGameCartridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [error, setError] = useState(null);

  const calculateStatistics = useCallback((data) => {
    const ratings = data.map(item => Number(item.rating) || 0);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length 
      : 0;
    setAverageRating(avgRating);

    const total = data.reduce((acc, game) => acc + (Number(game.price) || 0), 0);
    setTotalValue(total);
  }, []);

  const fetchGameCartridges = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const gameCartridgesArray = Array.isArray(data) ? data : [data];
      
      // If API returns empty data, use sample data
      const finalData = gameCartridgesArray.length > 0 ? gameCartridgesArray : SAMPLE_DATA;
      setGameCartridges(finalData);
      calculateStatistics(finalData);
      setError(null);
    } catch (error) {
      console.error('Error fetching game cartridges:', error);
      setError('Failed to load data. Using sample data instead.');
      setGameCartridges(SAMPLE_DATA);
      calculateStatistics(SAMPLE_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateStatistics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGameCartridges();
  }, [fetchGameCartridges]);

  useEffect(() => {
    fetchGameCartridges();
  }, [fetchGameCartridges]);

  const handleViewDetails = useCallback((game) => {
    Alert.alert(
      game.name,
      `${game.description}\n\nType: ${game.type}\nRating: ${game.rating}/5\nPrice: $${formatPrice(game.price)}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Buy Now', 
          onPress: () => Alert.alert('Coming Soon', 'Purchase feature will be available soon!'),
          style: 'default'
        }
      ]
    );
  }, []);

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const formatRating = (rating) => {
    const numRating = Number(rating);
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
  };

  const renderRatingStars = (rating) => {
    const numRating = Number(rating) || 0;
    return (
      <View style={styles.stars}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name={index < Math.round(numRating) ? 'star' : 'star-border'}
            size={16}
            color="#FFD700"
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  const renderGameCard = useCallback(({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleViewDetails(item)}
      >
        <Image
          source={{ uri: item.photo }}
          style={styles.photo}
          resizeMode="cover"
          defaultSource={require('../../../assets/icon.png')}
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
        />
        <View style={styles.cardOverlay}>
          <View style={styles.typeChip}>
            <Icon name="videogame-asset" size={14} color="#fff" />
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {renderRatingStars(item.rating)}
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.price}>${formatPrice(item.price)}</Text>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => handleViewDetails(item)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
              <Icon name="arrow-forward" size={16} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleViewDetails]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading your collection...</Text>
      </View>
    );
  }

  if (error && !gameCartridges.length) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#FF5252" />
        <Text style={styles.errorText}>Error loading collection</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchGameCartridges}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Icon name="sports-esports" size={32} color="#304FFE" />
          <Text style={styles.header}>PS2 Collection</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Icon name="games" size={28} color="#6200EE" />
            <Text style={styles.statValue}>{gameCartridges.length}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          
          <View style={[styles.statCard, { flex: 1 }]}>
            <Icon name="star" size={28} color="#FFD700" />
            <Text style={styles.statValue}>{formatRating(averageRating)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          
          <View style={[styles.statCard, { flex: 1 }]}>
            <Icon name="attach-money" size={28} color="#00C853" />
            <Text style={styles.statValue}>${formatPrice(totalValue)}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={gameCartridges}
        keyExtractor={(item) => item._id}
        renderItem={renderGameCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#304FFE"]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#304FFE',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 180,
  },
  cardOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 79, 254, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#304FFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
