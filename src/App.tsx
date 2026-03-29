import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, TextInput, Alert } from 'react-native';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RNLayout from './components/RNLayout';
import Home from './views/Home';
import Scan from './views/Scan';
import Market from './views/Market';
import Alerts from './views/Alerts';
import Profile from './views/Profile';
import { SupabaseProvider, useSupabase, ErrorBoundary } from './context/SupabaseContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Leaf, LogIn, Moon, Sun, Sparkles, UserPlus, Mail, Lock } from 'lucide-react';
import { hasAIKey, openAIKeySelector } from './services/gemini';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn, signUp } = useSupabase();
  const { theme, toggleTheme } = useTheme();
  const [hasKey, setHasKey] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const checkKey = async () => {
      const ok = await hasAIKey();
      setHasKey(ok);
    };
    checkKey();
  }, []);

  const handleConnectAI = async () => {
    const success = await openAIKeySelector();
    if (success) {
      setHasKey(true);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Success', 'Check your email for the confirmation link!');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#0c0a09' : '#f5f5f4' }]}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f5f5f4' }]}>
        <View style={styles.themeToggle}>
          <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
            {isDark ? <Sun color="#a8a29e" size={20} /> : <Moon color="#57534e" size={20} />}
          </TouchableOpacity>
        </View>

        <View style={styles.loginCard}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Leaf color="white" size={48} />
            </View>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1c1917' }]}>FreshGuard</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#a8a29e' : '#78716c' }]}>
              Reduce food waste and monitor freshness with AI.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Mail color={isDark ? '#a8a29e' : '#78716c'} size={20} />
              <TextInput
                style={[styles.input, { color: isDark ? '#ffffff' : '#1c1917' }]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Lock color={isDark ? '#a8a29e' : '#78716c'} size={20} />
              <TextInput
                style={[styles.input, { color: isDark ? '#ffffff' : '#1c1917' }]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              onPress={handleAuth} 
              style={[styles.signInButton, { opacity: authLoading ? 0.7 : 1 }]}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  {isSignUp ? <UserPlus color="white" size={20} /> : <LogIn color="white" size={20} />}
                  <Text style={styles.signInText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchButton}>
              <Text style={[styles.switchText, { color: isDark ? '#a8a29e' : '#78716c' }]}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {!hasKey && (
            <TouchableOpacity onPress={handleConnectAI} style={styles.aiButton}>
              <Sparkles color="#10b981" size={20} />
              <Text style={styles.aiText}>Connect AI API Key</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SupabaseProvider>
          <Router>
            <AuthGuard>
              <RNLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </RNLayout>
            </AuthGuard>
          </Router>
        </SupabaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  toggleButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    gap: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#059669',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  signInButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#059669',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  switchButton: {
    alignItems: 'center',
    padding: 8,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signInText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  aiText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
