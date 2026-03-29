import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, ShoppingBag, Bell, User, Leaf, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function RNLayout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Camera, label: 'AI Scan', path: '/scan' },
    { icon: ShoppingBag, label: 'Market', path: '/market' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0c0a09' : '#f5f5f4',
    },
    header: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#292524' : '#e7e5e4',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logoIcon: {
      width: 32,
      height: 32,
      backgroundColor: '#059669',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#34d399' : '#064e3b',
    },
    main: {
      flex: 1,
      paddingBottom: 80,
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#292524' : '#e7e5e4',
      paddingBottom: 8,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 12,
    },
    navItemActive: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    },
    navLabel: {
      fontSize: 10,
      fontWeight: '500',
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link to="/" style={{ textDecorationLine: 'none' }}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Leaf color="white" size={20} />
            </View>
            <Text style={styles.logoText}>FreshGuard</Text>
          </View>
        </Link>

        <TouchableOpacity onPress={toggleTheme} style={{ padding: 8 }}>
          {isDark ? <Sun color="#a8a29e" size={20} /> : <Moon color="#57534e" size={20} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.main}>
        {children}
      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ textDecorationLine: 'none' }}>
              <View style={[styles.navItem, isActive && styles.navItemActive]}>
                <Icon 
                  size={24} 
                  color={isActive ? '#10b981' : (isDark ? '#78716c' : '#a8a29e')} 
                />
                <Text style={[
                  styles.navLabel, 
                  { color: isActive ? '#10b981' : (isDark ? '#78716c' : '#a8a29e') }
                ]}>
                  {item.label}
                </Text>
              </View>
            </Link>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
