import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onLockApp?: () => void;
}

export default function SettingsScreen({ onLockApp }: SettingsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SECURITY</Text>

          <View style={styles.group}>
            <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onLockApp}>
              <View style={styles.rowLeft}>
                <Ionicons name="lock-closed-outline" size={16} color="#71717a" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Lock App Now</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#52525b" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="keypad-outline" size={16} color="#71717a" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>4-Digit PIN</Text>
              </View>
              <Text style={styles.rowBadgeText}>ENABLED</Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APPEARANCE</Text>

          <View style={styles.group}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="moon-outline" size={16} color="#71717a" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Theme</Text>
              </View>
              <Text style={styles.rowBadgeText}>DARK ONLY</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SYSTEM</Text>

          <View style={styles.group}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="information-circle-outline" size={16} color="#71717a" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Version</Text>
              </View>
              <Text style={styles.rowValueText}>1.0.0</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="code-slash-outline" size={16} color="#71717a" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Build</Text>
              </View>
              <Text style={styles.rowValueText}>6sceed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  title: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {},
  sectionHeader: {
    color: '#52525b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  group: {
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
  rowLabel: {
    color: '#fafafa',
    fontSize: 13,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#1f1f23',
    marginLeft: 40,
  },
  rowBadgeText: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rowValueText: {
    color: '#71717a',
    fontSize: 12,
  },
});