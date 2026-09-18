import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_STORAGE_KEY = '@apey_user_pin';
const DEFAULT_PIN = '0088';

export async function getStoredPin(): Promise<string> {
  try {
    const pin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
    return pin ? pin : DEFAULT_PIN;
  } catch (error) {
    return DEFAULT_PIN;
  }
}

export async function verifyPin(inputPin: string): Promise<boolean> {
  const currentPin = await getStoredPin();
  return inputPin === currentPin;
}

export async function setStoredPin(newPin: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(PIN_STORAGE_KEY, newPin);
    return true;
  } catch (error) {
    return false;
  }
}
