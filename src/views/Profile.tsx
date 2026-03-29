import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { User, Mail, Shield, LogOut, Settings, Bell, Heart, Package } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { user, signOut } = useSupabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!user) return null;

  const photoURL = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      gap: 24,
    },
    profileCard: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      padding: 32,
      borderRadius: 40,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      alignItems: 'center',
      gap: 16,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: isDark ? '#1c1917' : '#ffffff',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 48,
    },
    statusDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      backgroundColor: '#10b981',
      borderRadius: 12,
      borderWidth: 4,
      borderColor: isDark ? '#1c1917' : '#ffffff',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    userEmail: {
      fontSize: 14,
      color: isDark ? '#a8a29e' : '#78716c',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      padding: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      gap: 4,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: isDark ? '#78716c' : '#a8a29e',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    statDesc: {
      fontSize: 10,
      color: isDark ? '#78716c' : '#a8a29e',
    },
    settingsSection: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      borderRadius: 40,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      overflow: 'hidden',
    },
    sectionHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#292524' : '#f5f5f4',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: isDark ? '#78716c' : '#a8a29e',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginLeft: 16,
    },
    settingItem: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#292524' : '#f5f5f4',
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark ? '#292524' : '#f5f5f4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    settingSubtitle: {
      fontSize: 12,
      color: isDark ? '#78716c' : '#a8a29e',
    },
    footer: {
      textAlign: 'center',
      fontSize: 12,
      color: isDark ? '#78716c' : '#a8a29e',
      fontWeight: '500',
      paddingVertical: 24,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <User size={48} color="#059669" />
            )}
          </View>
          <View style={styles.statusDot} />
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={styles.userName}>{displayName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Mail size={14} color={isDark ? '#78716c' : '#a8a29e'} />
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Impact</Text>
          <Text style={[styles.statValue, { color: '#10b981' }]}>4.2kg</Text>
          <Text style={styles.statDesc}>Food waste prevented</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Points</Text>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>850</Text>
          <Text style={styles.statDesc}>FreshGuard rewards</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Account Settings</Text>
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={styles.settingIcon}>
              <Settings size={20} color={isDark ? '#a8a29e' : '#57534e'} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Preferences</Text>
              <Text style={styles.settingSubtitle}>Notification and display settings</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={styles.settingIcon}>
              <Shield size={20} color={isDark ? '#a8a29e' : '#57534e'} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingSubtitle}>Manage your data and account</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => signOut()}
          style={[styles.settingItem, { borderBottomWidth: 0 }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2' }]}>
              <LogOut size={20} color="#f43f5e" />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: '#f43f5e' }]}>Sign Out</Text>
              <Text style={[styles.settingSubtitle, { color: '#f43f5e', opacity: 0.7 }]}>Log out of your account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        FreshGuard v1.0.0 • Made with ❤️ for the planet
      </Text>
    </ScrollView>
  );
}
