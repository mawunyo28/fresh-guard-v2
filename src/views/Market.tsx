import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, TextInput, Modal } from 'react-native';
import { ShoppingBag, MapPin, User, Clock, Search, Filter, Plus, X, Tag } from 'lucide-react';
import { supabase, handleSupabaseError } from '../supabase';
import { useSupabase } from '../context/SupabaseContext';
import { MarketplaceListing } from '../types';
import { useTheme } from '../context/ThemeContext';

export default function Market() {
  const { user } = useSupabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    quantity: '',
    location: '',
    price: 'Free',
    type: 'any' as const
  });

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('marketplace')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'LIST_MARKETPLACE');
    else {
      const items = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        location: item.location,
        price: item.price,
        type: item.type,
        sellerId: item.seller_id,
        sellerName: item.seller_name,
        createdAt: item.created_at,
        status: item.status,
        imageUrl: item.image_url
      } as MarketplaceListing));
      setListings(items);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();

    const subscription = supabase
      .channel('marketplace_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'marketplace' 
      }, () => {
        fetchListings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleCreateListing = async () => {
    if (!user) return;
    const listingData = {
      title: newListing.title,
      description: newListing.description,
      quantity: newListing.quantity,
      location: newListing.location,
      price: newListing.price,
      type: newListing.type,
      seller_id: user.id,
      seller_name: user.user_metadata?.full_name || user.email || 'Anonymous',
      created_at: new Date().toISOString(),
      status: 'available'
    };

    try {
      const { error } = await supabase
        .from('marketplace')
        .insert([listingData]);

      if (error) throw error;

      setIsModalOpen(false);
      setNewListing({ title: '', description: '', quantity: '', location: '', price: 'Free', type: 'any' });
    } catch (error) {
      handleSupabaseError(error, 'CREATE_LISTING');
    }
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      gap: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#a8a29e' : '#78716c',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#1c1917',
    },
    listingCard: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      borderRadius: 32,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      overflow: 'hidden',
      marginBottom: 16,
    },
    listingImage: {
      width: '100%',
      height: 200,
      backgroundColor: isDark ? '#292524' : '#f5f5f4',
    },
    listingContent: {
      padding: 20,
      gap: 12,
    },
    listingTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    listingDescription: {
      fontSize: 14,
      color: isDark ? '#a8a29e' : '#78716c',
      lineHeight: 20,
    },
    listingMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#292524' : '#f5f5f4',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: isDark ? '#78716c' : '#a8a29e',
      fontWeight: '500',
    },
    priceTag: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: '#059669',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    priceText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
    fab: {
      position: 'absolute',
      bottom: 88,
      right: 16,
      backgroundColor: '#059669',
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      borderRadius: 32,
      padding: 24,
      gap: 16,
    },
    modalInput: {
      backgroundColor: isDark ? '#292524' : '#f5f5f4',
      padding: 12,
      borderRadius: 16,
      color: isDark ? '#ffffff' : '#1c1917',
      borderWidth: 1,
      borderColor: isDark ? '#44403c' : '#e7e5e4',
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ gap: 8 }}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Find animal feed or fertilizer from local waste producers.</Text>
        </View>

        <View style={styles.searchBar}>
          <Search size={20} color={isDark ? '#78716c' : '#a8a29e'} />
          <TextInput
            placeholder="Search listings..."
            placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Filter size={20} color={isDark ? '#78716c' : '#a8a29e'} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" />
        ) : filteredListings.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 48, gap: 16 }}>
            <ShoppingBag size={48} color={isDark ? '#292524' : '#e7e5e4'} />
            <Text style={styles.subtitle}>No listings found matching your search.</Text>
          </View>
        ) : (
          filteredListings.map((listing) => (
            <TouchableOpacity key={listing.id} style={styles.listingCard}>
              <View style={styles.listingImage}>
                {listing.imageUrl ? (
                  <Image source={{ uri: listing.imageUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={48} color={isDark ? '#44403c' : '#e7e5e4'} />
                  </View>
                )}
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{listing.price}</Text>
                </View>
              </View>
              <View style={styles.listingContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <View style={{ backgroundColor: isDark ? 'rgba(5, 150, 105, 0.1)' : '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#059669', textTransform: 'uppercase' }}>{listing.type}</Text>
                  </View>
                </View>
                <Text style={styles.listingDescription} numberOfLines={2}>{listing.description}</Text>
                <View style={styles.listingMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color={isDark ? '#78716c' : '#a8a29e'} />
                    <Text style={styles.metaText}>{listing.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <User size={14} color={isDark ? '#78716c' : '#a8a29e'} />
                    <Text style={styles.metaText}>{listing.sellerName}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={isDark ? '#78716c' : '#a8a29e'} />
                    <Text style={styles.metaText}>{new Date(listing.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Plus size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.title, { fontSize: 20 }]}>Create Listing</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color={isDark ? '#78716c' : '#a8a29e'} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              placeholder="Listing Title"
              placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
              style={styles.modalInput}
              value={newListing.title}
              onChangeText={(text) => setNewListing({ ...newListing, title: text })}
            />
            
            <TextInput
              placeholder="Description"
              placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
              style={[styles.modalInput, { height: 100 }]}
              multiline
              value={newListing.description}
              onChangeText={(text) => setNewListing({ ...newListing, description: text })}
            />

            <TextInput
              placeholder="Location"
              placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
              style={styles.modalInput}
              value={newListing.location}
              onChangeText={(text) => setNewListing({ ...newListing, location: text })}
            />

            <TouchableOpacity onPress={handleCreateListing} style={{ backgroundColor: '#059669', padding: 16, borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Post Listing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
