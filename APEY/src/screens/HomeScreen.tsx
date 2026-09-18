import { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppContext';
import { Account } from '../types';
import { formatRemainingTime } from '../utils/cooldown';

export default function HomeScreen() {
  const { accounts } = useAppData();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailShowPassword, setDetailShowPassword] = useState(true);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const activeCount = accounts.filter((a) => {
    if (a.status === 'COOLDOWN' && a.resetAt) {
      const { isExpired } = formatRemainingTime(a.resetAt);
      if (isExpired) return true;
    }
    return a.status === 'ACTIVE';
  }).length;

  const cooldownCount = accounts.filter((a) => {
    if (a.status === 'COOLDOWN') {
      if (a.resetAt) {
        const { isExpired } = formatRemainingTime(a.resetAt);
        return !isExpired;
      }
      return true;
    }
    return false;
  }).length;

  const totalCount = accounts.length;

  const handleCardPress = (account: Account) => {
    setSelectedAccount(account);
    setDetailShowPassword(true);
    setDetailModalVisible(true);
  };

  const handleCopyNotice = (label: string) => {
    setCopiedNotice(label);
    setTimeout(() => {
      setCopiedNotice(null);
    }, 1800);
  };

  const currentDetailAccount = accounts.find((a) => a.id === selectedAccount?.id) || selectedAccount;

  const renderItem = ({ item }: { item: Account }) => {
    const cooldownInfo = formatRemainingTime(item.resetAt);
    const isCooldown = item.status === 'COOLDOWN' && !cooldownInfo.isExpired;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.providerRow}>
            <Ionicons name="key-outline" size={14} color="#71717a" style={styles.cardIcon} />
            <Text style={styles.providerText}>{item.provider}</Text>
          </View>
          <View style={[styles.statusBadge, isCooldown ? styles.cooldownBadge : styles.activeBadge]}>
            <Text style={[styles.statusText, isCooldown ? styles.cooldownText : styles.activeText]}>
              {isCooldown ? 'COOLDOWN' : 'ACTIVE'}
            </Text>
          </View>
        </View>

        <Text style={styles.emailText}>{item.gmailUsername || item.email}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.modelText}>{item.model}</Text>
          {isCooldown && (
            <View style={styles.countdownRow}>
              <Ionicons name="time-outline" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
              <Text style={styles.countdownText}>
                {cooldownInfo.formatted}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brand}>APEY</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{activeCount}</Text>
            <Text style={styles.metricLabel}>ACTIVE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{cooldownCount}</Text>
            <Text style={styles.metricLabel}>COOLDOWN</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{totalCount}</Text>
            <Text style={styles.metricLabel}>TOTAL</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>NO ACCOUNTS AVAILABLE</Text>
          </View>
        }
      />

      {/* ACCOUNT DETAIL VIEW MODAL ON HOME */}
      <Modal visible={detailModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentDetailAccount && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailHeaderRow}>
                  <Text style={styles.detailProvider}>{currentDetailAccount.provider}</Text>
                  {(() => {
                    const cooldownInfo = formatRemainingTime(currentDetailAccount.resetAt);
                    const isCooldown = currentDetailAccount.status === 'COOLDOWN' && !cooldownInfo.isExpired;
                    return (
                      <View style={[styles.badge, isCooldown ? styles.cooldownBadge : styles.activeBadge]}>
                        <Text style={[styles.badgeText, isCooldown ? styles.cooldownText : styles.activeText]}>
                          {isCooldown ? 'COOLDOWN' : 'ACTIVE'}
                        </Text>
                      </View>
                    );
                  })()}
                </View>

                {copiedNotice && (
                  <View style={styles.copiedBanner}>
                    <Text style={styles.copiedBannerText}>COPIED {copiedNotice.toUpperCase()}</Text>
                  </View>
                )}

                {/* API KEY BOX */}
                <Text style={styles.label}>API KEY</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTextMonospace}>
                    {currentDetailAccount.apiKey || 'No API Key set'}
                  </Text>
                  {currentDetailAccount.apiKey && (
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={() => handleCopyNotice('API Key')}
                    >
                      <Ionicons name="copy-outline" size={14} color="#fafafa" />
                      <Text style={styles.copyBtnText}>COPY</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* GMAIL USERNAME */}
                <Text style={styles.label}>GMAIL USERNAME</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxText}>
                    {currentDetailAccount.gmailUsername || currentDetailAccount.email}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => handleCopyNotice('Username')}
                  >
                    <Ionicons name="copy-outline" size={14} color="#fafafa" />
                    <Text style={styles.copyBtnText}>COPY</Text>
                  </TouchableOpacity>
                </View>

                {/* GMAIL PASSWORD */}
                {currentDetailAccount.gmailPassword && (
                  <>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.label}>GMAIL PASSWORD</Text>
                      <TouchableOpacity onPress={() => setDetailShowPassword(!detailShowPassword)}>
                        <Text style={styles.inlineAddText}>
                          {detailShowPassword ? 'HIDE' : 'SHOW'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailBoxTextMonospace}>
                        {detailShowPassword ? currentDetailAccount.gmailPassword : '••••••••••••'}
                      </Text>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopyNotice('Password')}
                      >
                        <Ionicons name="copy-outline" size={14} color="#fafafa" />
                        <Text style={styles.copyBtnText}>COPY</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* MODEL & FOLDER */}
                <View style={styles.detailMetaGrid}>
                  <View style={styles.metaRow}>
                    <Ionicons name="hardware-chip-outline" size={13} color="#71717a" style={styles.metaIcon} />
                    <Text style={styles.detailMetaLabel}>Model: </Text>
                    <Text style={styles.detailMetaValue}>{currentDetailAccount.model}</Text>
                  </View>

                  {currentDetailAccount.folderId && (
                    <View style={styles.metaRow}>
                      <Ionicons name="folder-outline" size={13} color="#71717a" style={styles.metaIcon} />
                      <Text style={styles.detailMetaLabel}>Folder: </Text>
                      <Text style={styles.detailMetaValue}>{currentDetailAccount.folderId}</Text>
                    </View>
                  )}

                  {(() => {
                    const cooldownInfo = formatRemainingTime(currentDetailAccount.resetAt);
                    const isCooldown = currentDetailAccount.status === 'COOLDOWN' && !cooldownInfo.isExpired;
                    if (!isCooldown) return null;
                    return (
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={13} color="#f59e0b" style={styles.metaIcon} />
                        <Text style={styles.detailMetaLabel}>Cooldown Remaining: </Text>
                        <Text style={styles.cooldownValue}>{cooldownInfo.formatted}</Text>
                      </View>
                    );
                  })()}

                  {currentDetailAccount.expirationDate && (
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={13} color="#71717a" style={styles.metaIcon} />
                      <Text style={styles.detailMetaLabel}>Expiration: </Text>
                      <Text style={styles.detailMetaValue}>{currentDetailAccount.expirationDate}</Text>
                    </View>
                  )}
                </View>

                {currentDetailAccount.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>{currentDetailAccount.notes}</Text>
                  </View>
                )}

                {/* MODAL ACTIONS */}
                <View style={styles.detailActionsRow}>
                  <TouchableOpacity
                    style={styles.detailCloseBtn}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Text style={styles.detailCloseBtnText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    color: '#fafafa',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141417',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
  },
  metricLabel: {
    color: '#71717a',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#27272a',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 6,
  },
  providerText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  cooldownBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeText: {
    color: '#22c55e',
  },
  cooldownText: {
    color: '#f59e0b',
  },
  emailText: {
    color: '#71717a',
    fontSize: 12,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f1f23',
    paddingTop: 8,
  },
  modelText: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: '500',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#52525b',
    fontSize: 11,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 20,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailProvider: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copiedBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  copiedBannerText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detailBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  detailBoxText: {
    color: '#fafafa',
    fontSize: 13,
    flex: 1,
  },
  detailBoxTextMonospace: {
    color: '#fafafa',
    fontSize: 13,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  copyBtnText: {
    color: '#fafafa',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailMetaGrid: {
    gap: 8,
    marginVertical: 12,
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    padding: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  detailMetaLabel: {
    color: '#71717a',
    fontSize: 12,
  },
  detailMetaValue: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '500',
  },
  cooldownValue: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  notesBox: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  notesText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontStyle: 'italic',
  },
  detailActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  detailCloseBtn: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  detailCloseBtnText: {
    color: '#09090b',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    color: '#52525b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  inlineAddText: {
    color: '#fafafa',
    fontSize: 10,
    fontWeight: '600',
  },
});