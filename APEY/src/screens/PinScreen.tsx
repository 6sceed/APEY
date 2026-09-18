import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { verifyPin } from '../storage/pinStorage';

interface PinScreenProps {
  onSuccess: () => void;
}

export default function PinScreen({ onSuccess }: PinScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleKeyPress = async (val: string) => {
    if (isError) setIsError(false);
    if (pin.length >= 4) return;

    const nextPin = pin + val;
    setPin(nextPin);

    if (nextPin.length === 4) {
      const isValid = await verifyPin(nextPin);
      if (isValid) {
        onSuccess();
      } else {
        setIsError(true);
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (isError) setIsError(false);
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>APEY</Text>
        <Text style={[styles.subtitle, isError && styles.errorSubtitle]}>
          {isError ? 'Invalid PIN' : 'Enter PIN'}
        </Text>
      </View>

      <View style={styles.indicatorContainer}>
        {[0, 1, 2, 3].map((index) => {
          const isFilled = pin.length > index;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isFilled && styles.dotFilled,
                isError && styles.dotError,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.keypadContainer}>
        <View style={styles.row}>
          {['1', '2', '3'].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              activeOpacity={0.6}
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          {['4', '5', '6'].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              activeOpacity={0.6}
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          {['7', '8', '9'].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              activeOpacity={0.6}
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.emptyKey} />
          <TouchableOpacity
            style={styles.key}
            activeOpacity={0.6}
            onPress={() => handleKeyPress('0')}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.key}
            activeOpacity={0.6}
            onPress={handleDelete}
          >
            <Ionicons name="backspace-outline" size={22} color="#71717a" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    color: '#fafafa',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 13,
    letterSpacing: 1,
  },
  errorSubtitle: {
    color: '#ef4444',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#27272a',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#fafafa',
    borderColor: '#fafafa',
  },
  dotError: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  key: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyKey: {
    width: 64,
    height: 64,
  },
  keyText: {
    color: '#fafafa',
    fontSize: 22,
    fontWeight: '500',
  },
});
