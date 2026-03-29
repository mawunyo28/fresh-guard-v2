import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { Plus, AlertTriangle, CheckCircle, Clock, Thermometer, Droplets, Wind, X, Calendar, TrendingUp } from 'lucide-react';
import { supabase, handleSupabaseError } from '../supabase';
import { useSupabase } from '../context/SupabaseContext';
import { FoodItem, SensorData } from '../types';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { user } = useSupabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'fruit', expiryDate: '', quantity: '' });
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchFoodItems = async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: true });

      if (error) handleSupabaseError(error, 'LIST_FOOD_ITEMS');
      else {
        // Map snake_case to camelCase if needed, or just use snake_case in types
        const items = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          expiryDate: item.expiry_date,
          quantity: item.quantity,
          status: item.status,
          userId: item.user_id,
          addedAt: item.added_at
        } as FoodItem));
        setFoodItems(items);
        setLoading(false);
      }
    };

    fetchFoodItems();

    // Real-time subscription
    const subscription = supabase
      .channel('food_items_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_items',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchFoodItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchSensors = async () => {
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) handleSupabaseError(error, 'LIST_SENSORS');
      else {
        const readings = (data || []).map(r => ({
          id: r.id,
          temperature: r.temperature,
          humidity: r.humidity,
          gasLevel: r.gas_level,
          status: r.status,
          timestamp: r.timestamp,
          userId: r.user_id
        } as SensorData));
        setSensorHistory(readings.reverse());
      }
    };

    fetchSensors();

    const subscription = supabase
      .channel('sensors_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sensors',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchSensors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleAddItem = async () => {
    if (!user) return;

    const itemData = {
      name: newItem.name,
      type: newItem.type,
      expiry_date: newItem.expiryDate,
      quantity: newItem.quantity,
      user_id: user.id,
      added_at: new Date().toISOString(),
      status: 'fresh'
    };

    try {
      const { error } = await supabase
        .from('food_items')
        .insert([itemData]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewItem({ name: '', type: 'fruit', expiryDate: '', quantity: '' });
    } catch (error) {
      handleSupabaseError(error, 'CREATE_FOOD_ITEM');
    }
  };

  const latestSensor = sensorHistory[sensorHistory.length - 1] || {
    temperature: 22.5,
    humidity: 45,
    gasLevel: 0.1,
    status: 'normal'
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      gap: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#a8a29e' : '#78716c',
    },
    card: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      padding: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      gap: 12,
    },
    sensorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    sensorCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      padding: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      gap: 12,
    },
    sensorIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sensorValue: {
      fontSize: 32,
      fontWeight: '300',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    sensorUnit: {
      fontSize: 14,
      color: isDark ? '#78716c' : '#a8a29e',
    },
    inventoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      padding: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      marginBottom: 8,
    },
    itemIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    itemMeta: {
      fontSize: 12,
      color: isDark ? '#a8a29e' : '#78716c',
      textTransform: 'uppercase',
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
    input: {
      backgroundColor: isDark ? '#292524' : '#f5f5f4',
      padding: 12,
      borderRadius: 16,
      color: isDark ? '#ffffff' : '#1c1917',
      borderWidth: 1,
      borderColor: isDark ? '#44403c' : '#e7e5e4',
    },
    button: {
      backgroundColor: '#059669',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Welcome back, {displayName.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>You've saved 4.2kg of food this month. Keep it up!</Text>
      </View>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>Real-time Sensors</Text>
        </View>
        <View style={styles.sensorGrid}>
          <View style={styles.sensorCard}>
            <View style={[styles.sensorIcon, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff' }]}>
              <Thermometer size={20} color="#2563eb" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.sensorValue}>{latestSensor.temperature}</Text>
              <Text style={styles.sensorUnit}>°C</Text>
            </View>
          </View>

          <View style={styles.sensorCard}>
            <View style={[styles.sensorIcon, { backgroundColor: isDark ? 'rgba(8, 145, 178, 0.1)' : '#ecfeff' }]}>
              <Droplets size={20} color="#0891b2" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.sensorValue}>{latestSensor.humidity}</Text>
              <Text style={styles.sensorUnit}>%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>Your Inventory</Text>
          <TouchableOpacity 
            onPress={() => setIsModalOpen(true)}
            style={{ backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" />
        ) : foodItems.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', borderStyle: 'dashed', padding: 32 }]}>
            <Plus size={32} color={isDark ? '#44403c' : '#e7e5e4'} />
            <Text style={styles.subtitle}>Your inventory is empty.</Text>
          </View>
        ) : (
          foodItems.map((item) => (
            <View key={item.id} style={styles.inventoryItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[
                  styles.itemIcon, 
                  { backgroundColor: item.status === 'fresh' ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5') : (isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2') }
                ]}>
                  {item.status === 'fresh' ? <CheckCircle size={24} color="#10b981" /> : <AlertTriangle size={24} color="#f43f5e" />}
                </View>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.type} • {item.quantity}</Text>
                </View>
              </View>
              <Text style={[styles.itemMeta, { color: item.status === 'spoilt' ? '#f43f5e' : (isDark ? '#78716c' : '#a8a29e') }]}>
                {item.status === 'spoilt' ? 'Spoilt' : `Exp: ${new Date(item.expiryDate).toLocaleDateString()}`}
              </Text>
            </View>
          ))
        )}
      </View>

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Add New Item</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color={isDark ? '#78716c' : '#a8a29e'} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              placeholder="Item Name"
              placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
              style={styles.input}
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            />
            
            <TextInput
              placeholder="Quantity (e.g. 500g)"
              placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
              style={styles.input}
              value={newItem.quantity}
              onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
            />
            
            <TextInput
              placeholder="Expiry Date (YYYY-MM-DD)"
              placeholderTextColor={isDark ? '#78716c' : '#a8a29e'}
              style={styles.input}
              value={newItem.expiryDate}
              onChangeText={(text) => setNewItem({ ...newItem, expiryDate: text })}
            />

            <TouchableOpacity onPress={handleAddItem} style={styles.button}>
              <Text style={styles.buttonText}>Save Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
