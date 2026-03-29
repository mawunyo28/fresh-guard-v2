import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Bell, Calendar, Clock, AlertTriangle, CheckCircle, Trash2, Thermometer, Wind } from 'lucide-react';
import { supabase, handleSupabaseError } from '../supabase';
import { useSupabase } from '../context/SupabaseContext';
import { FoodItem, SensorData } from '../types';
import { formatDistanceToNow, isPast, isWithinInterval, addDays, startOfDay } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info';
  date: string;
  icon: any;
  actionLabel?: string;
}

export default function Alerts() {
  const { user } = useSupabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let foodItems: FoodItem[] = [];
    let sensorReadings: SensorData[] = [];

    const updateAlerts = () => {
      const newAlerts: AlertItem[] = [];

      // Process Food Items
      foodItems.forEach(item => {
        const expiry = new Date(item.expiryDate);
        const now = new Date();
        const threeDaysFromNow = addDays(startOfDay(now), 3);

        if (isPast(expiry)) {
          newAlerts.push({
            id: `food-expired-${item.id}`,
            title: `${item.name} Spoilt`,
            description: `${item.name} has passed its freshness window. Consider listing it on the marketplace for fertilizer.`,
            type: 'critical',
            date: formatDistanceToNow(expiry, { addSuffix: true }),
            icon: Trash2,
            actionLabel: 'List on Market'
          });
        } else if (isWithinInterval(expiry, { start: now, end: threeDaysFromNow })) {
          newAlerts.push({
            id: `food-expiring-${item.id}`,
            title: `${item.name} Expiring Soon`,
            description: `${item.name} will spoil in ${formatDistanceToNow(expiry)}. Use it soon!`,
            type: 'warning',
            date: 'Expiring Soon',
            icon: Clock,
            actionLabel: 'View Item'
          });
        }
      });

      // Process Sensor Data (Latest reading)
      if (sensorReadings.length > 0) {
        const latest = sensorReadings.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        if (latest.status === 'critical') {
          newAlerts.push({
            id: `sensor-critical-${latest.id}`,
            title: 'Critical Storage Condition',
            description: `High gas levels or temperature detected! Check your storage area immediately.`,
            type: 'critical',
            date: 'Just now',
            icon: AlertTriangle,
            actionLabel: 'Check Sensors'
          });
        } else if (latest.status === 'warning') {
          newAlerts.push({
            id: `sensor-warning-${latest.id}`,
            title: 'Storage Warning',
            description: `Environmental conditions are deviating from optimal. Monitor your fresh produce.`,
            type: 'warning',
            date: 'Recent',
            icon: Wind,
            actionLabel: 'Check Sensors'
          });
        }
      }

      setAlerts(newAlerts);
      setLoading(false);
    };

    const fetchAll = async () => {
      const [foodRes, sensorRes] = await Promise.all([
        supabase.from('food_items').select('*').eq('user_id', user.id),
        supabase.from('sensors').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(1)
      ]);

      if (foodRes.error) handleSupabaseError(foodRes.error, 'LIST_FOOD_ITEMS');
      else {
        foodItems = (foodRes.data || []).map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          expiryDate: item.expiry_date,
          quantity: item.quantity,
          status: item.status,
          userId: item.user_id,
          addedAt: item.added_at
        } as FoodItem));
      }

      if (sensorRes.error) handleSupabaseError(sensorRes.error, 'LIST_SENSORS');
      else {
        sensorReadings = (sensorRes.data || []).map(r => ({
          id: r.id,
          temperature: r.temperature,
          humidity: r.humidity,
          gasLevel: r.gas_level,
          status: r.status,
          timestamp: r.timestamp,
          userId: r.user_id
        } as SensorData));
      }

      updateAlerts();
    };

    fetchAll();

    const foodSub = supabase
      .channel('food_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items', filter: `user_id=eq.${user.id}` }, fetchAll)
      .subscribe();

    const sensorSub = supabase
      .channel('sensor_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sensors', filter: `user_id=eq.${user.id}` }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(foodSub);
      supabase.removeChannel(sensorSub);
    };
  }, [user]);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      gap: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#a8a29e' : '#78716c',
      textAlign: 'center',
    },
    alertCard: {
      padding: 16,
      borderRadius: 24,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    alertDate: {
      fontSize: 10,
      fontWeight: 'bold',
      color: isDark ? '#78716c' : '#a8a29e',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    alertDescription: {
      fontSize: 14,
      color: isDark ? '#d6d3d1' : '#57534e',
      lineHeight: 20,
    },
    actionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#059669' : '#1c1917',
    },
    actionText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    dismissButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#292524' : '#ffffff',
      borderWidth: 1,
      borderColor: isDark ? '#44403c' : '#e7e5e4',
    },
    dismissText: {
      color: isDark ? '#d6d3d1' : '#57534e',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ gap: 8 }}>
        <Text style={styles.title}>Freshness Alerts</Text>
        <Text style={styles.subtitle}>Stay on top of your food inventory and reduce waste.</Text>
      </View>

      {loading ? (
        <View style={{ padding: 48 }}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : alerts.length > 0 ? (
        <View style={{ gap: 12 }}>
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alert.type === 'critical' ? (isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2') : (isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb'),
                    borderColor: alert.type === 'critical' ? (isDark ? 'rgba(244, 63, 94, 0.2)' : '#ffe4e6') : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'),
                  }
                ]}
              >
                <View style={[
                  styles.iconContainer,
                  {
                    backgroundColor: alert.type === 'critical' ? (isDark ? 'rgba(244, 63, 94, 0.2)' : '#ffe4e6') : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'),
                  }
                ]}>
                  <Icon size={24} color={alert.type === 'critical' ? '#f43f5e' : '#f59e0b'} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertDate}>{alert.date}</Text>
                  </View>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity style={styles.dismissButton}>
                      <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                    {alert.actionLabel && (
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionText}>{alert.actionLabel}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[styles.alertCard, { backgroundColor: isDark ? '#1c1917' : '#ffffff', borderColor: isDark ? '#292524' : '#e7e5e4', alignItems: 'center', justifyContent: 'center', padding: 48, flexDirection: 'column' }]}>
          <View style={{ width: 64, height: 64, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <CheckCircle size={32} color="#10b981" />
          </View>
          <Text style={styles.alertTitle}>All caught up!</Text>
          <Text style={styles.subtitle}>You've addressed all recent freshness alerts.</Text>
        </View>
      )}
    </ScrollView>
  );
}
