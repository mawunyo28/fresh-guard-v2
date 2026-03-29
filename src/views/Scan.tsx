import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Camera, Upload, CheckCircle, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { analyzeFruitSpoilage, SpoilageAnalysis, hasAIKey, openAIKeySelector } from '../services/gemini';
import { useTheme } from '../context/ThemeContext';

export default function Scan() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpoilageAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(true);

  React.useEffect(() => {
    const checkKey = async () => {
      const ok = await hasAIKey();
      setHasKey(ok);
    };
    checkKey();
  }, []);

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    const ok = await hasAIKey();
    if (!ok) {
      setHasKey(false);
      setError("AI API Key not found. Please connect your API key.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeFruitSpoilage(image);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAI = async () => {
    const success = await openAIKeySelector();
    if (success) {
      setHasKey(true);
      setError(null);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

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
    uploadCard: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      borderRadius: 32,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      overflow: 'hidden',
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
      padding: 32,
    },
    image: {
      width: '100%',
      height: 300,
      resizeMode: 'cover',
    },
    button: {
      backgroundColor: '#059669',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    resultCard: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
      padding: 24,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    analysisCard: {
      backgroundColor: isDark ? '#1c1917' : '#ffffff',
      padding: 24,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: isDark ? '#292524' : '#e7e5e4',
      gap: 12,
    },
    errorCard: {
      backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(244, 63, 94, 0.2)' : '#ffe4e6',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      color: '#f43f5e',
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ gap: 8 }}>
        <Text style={styles.title}>AI Spoilage Detection</Text>
        <Text style={styles.subtitle}>Take a photo of your fruit to see how long it will stay fresh.</Text>
      </View>

      <View style={styles.uploadCard}>
        {!image ? (
          <>
            <View style={{ width: 80, height: 80, backgroundColor: isDark ? 'rgba(5, 150, 105, 0.1)' : '#ecfdf5', borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={40} color="#059669" />
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#ffffff' : '#1c1917' }}>Upload or take a photo</Text>
              <Text style={{ fontSize: 12, color: isDark ? '#78716c' : '#a8a29e' }}>Supported formats: JPG, PNG</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = handleImageUpload;
                input.click();
              }}
              style={styles.button}
            >
              <Upload size={20} color="white" />
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ width: '100%', position: 'relative' }}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity 
              onPress={reset}
              style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20 }}
            >
              <RefreshCw size={20} color="#1c1917" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {image && !result && !loading && (
        <TouchableOpacity onPress={handleAnalyze} style={[styles.button, { alignSelf: 'center', paddingHorizontal: 32, paddingVertical: 16 }]}>
          <Sparkles size={20} color="white" />
          <Text style={[styles.buttonText, { fontSize: 16 }]}>Analyze Freshness</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={{ alignItems: 'center', gap: 16, padding: 32 }}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.subtitle}>AI is analyzing your fruit...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <AlertTriangle size={20} color="#f43f5e" />
          <Text style={styles.errorText}>{error}</Text>
          {!hasKey && (
            <TouchableOpacity onPress={handleConnectAI} style={{ padding: 8 }}>
              <Text style={{ color: '#059669', fontWeight: 'bold' }}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {result && (
        <View style={{ gap: 16 }}>
          <View style={styles.resultCard}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#059669', textTransform: 'uppercase' }}>Estimated Freshness</Text>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: isDark ? '#34d399' : '#064e3b' }}>{result.daysUntilSpoilt} Days</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#059669', textTransform: 'uppercase' }}>Confidence</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#34d399' : '#064e3b' }}>{Math.round(result.confidence * 100)}%</Text>
            </View>
          </View>

          <View style={styles.analysisCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} color="#059669" />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#ffffff' : '#1c1917' }}>AI Analysis</Text>
            </View>
            <Text style={{ fontSize: 14, color: isDark ? '#a8a29e' : '#78716c', lineHeight: 22 }}>{result.reasoning}</Text>
          </View>

          <View style={styles.analysisCard}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#ffffff' : '#1c1917' }}>Freshness Tips</Text>
            {result.recommendations.map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 24, height: 24, backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ecfdf5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#059669' }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: isDark ? '#a8a29e' : '#78716c' }}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
