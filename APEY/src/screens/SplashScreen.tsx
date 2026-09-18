import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>APEY</Text>
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>6sceed</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fafafa',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
  },
  footerContainer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#52525b',
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});
