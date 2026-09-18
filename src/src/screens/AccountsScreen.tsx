import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppContext';
import { Account, AccountStatus } from '../types';
import { formatRemainingTime, parseResetDateTime } from '../utils/cooldown';

export default function AccountsScreen() {
  const {
    accounts,
    folders,
    addAccount,
    updateAccount,
    deleteAccount,
    reorderAccount,
    addFolder,
    deleteFolder,
  } = useAppData();

  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('ALL');

  // Modals state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);

  // Active Detail / Edit Account
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Form State
  const [provider, setProvider] = useState('Gemini');
  const [email, setEmail] = useState('');
  const [gmailUsername, setGmailUsername] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini 1.5 Flash');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [status, setStatus] = useState<AccountStatus>('ACTIVE');
  const [resetDateTimeInput, setResetDateTimeInput] = useState('2026-09-19 21:00');
  const [expiration, setExpiration] = useState('');
  const [notes, setNotes] = useState('');

  // Password / API Key Visibility toggles for Card view
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [visibleApiKeys, setVisibleApiKeys] = useState<Record<string, boolean>>({});
  const [detailShowPassword, setDetailShowPassword] = useState(true);

  // Sub-modal creation inputs
  const [newFolderName, setNewFolderName] = useState('');

  const filteredAccounts = accounts.filter((a) => {
    if (activeFolderFilter === 'ALL') return true;
    return a.folderId === activeFolderFilter;
  });

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

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const openEditModal = (account: Account) => {
    setSelectedAccount(account);
    setProvider(account.provider);
    setEmail(account.email);
    setGmailUsername(account.gmailUsername ?? account.email);
    setGmailPassword(account.gmailPassword ?? '');
    setApiKey(account.apiKey ?? '');
    setSelectedModel(account.model);
    setSelectedFolder(account.folderId ?? '');
    setStatus(account.status);

    if (account.resetAt) {
      const d = new Date(account.resetAt);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        setResetDateTimeInput(`${year}-${month}-${day} ${hours}:${mins}`);
      } else {
        setResetDateTimeInput('2026-09-19 21:00');
      }
    } else {
      setResetDateTimeInput('2026-09-19 21:00');
    }

    setExpiration(account.expirationDate ?? '');
    setNotes(account.notes ?? '');
    setDetailModalVisible(false);
    setEditModalVisible(true);
  };

  const handleCreateAccount = async () => {
    if (!gmailUsername.trim() && !email.trim()) {
      Alert.alert('Required', 'Gmail username or identifier is required');
      return;
    }

    const accountEmail = gmailUsername.trim() || email.trim();
    let parsedResetAt: string | undefined = undefined;
    if (status === 'COOLDOWN' && resetDateTimeInput.trim()) {
      parsedResetAt = parseResetDateTime(resetDateTimeInput.trim());
    }

    await addAccount({
      provider: provider.trim() || 'Custom',
      email: accountEmail,
      gmailUsername: accountEmail,
      gmailPassword: gmailPassword.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      model: selectedModel.trim() || 'Default',
      status,
      resetAt: parsedResetAt,
      expirationDate: expiration.trim() || undefined,
      folderId: selectedFolder ? selectedFolder : undefined,
      notes: notes.trim() || undefined,
    });

    resetForm();
    setCreateModalVisible(false);
  };

  const handleSaveEditAccount = async () => {
    if (!selectedAccount) return;
    if (!gmailUsername.trim() && !email.trim()) {
      Alert.alert('Required', 'Gmail username or identifier is required');
      return;
    }

    const accountEmail = gmailUsername.trim() || email.trim();
    let parsedResetAt: string | undefined = undefined;
    if (status === 'COOLDOWN' && resetDateTimeInput.trim()) {
      parsedResetAt = parseResetDateTime(resetDateTimeInput.trim());
    }

    const updatedData: Partial<Account> = {
      provider: provider.trim() || 'Custom',
      email: accountEmail,
      gmailUsername: accountEmail,
      gmailPassword: gmailPassword.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      model: selectedModel.trim() || 'Default',
      status,
      resetAt: parsedResetAt,
      expirationDate: expiration.trim() || undefined,
      folderId: selectedFolder ? selectedFolder : undefined,
      notes: notes.trim() || undefined,
    };

    await updateAccount(selectedAccount.id, updatedData);
    setSelectedAccount({ ...selectedAccount, ...updatedData });
    resetForm();
    setEditModalVisible(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await addFolder(newFolderName.trim());
    setNewFolderName('');
    setFolderModalVisible(false);
  };

  const resetForm = () => {
    setSelectedAccount(null);
    setProvider('Gemini');
    setEmail('');
    setGmailUsername('');
    setGmailPassword('');
    setApiKey('');
    setSelectedModel('Gemini 1.5 Flash');
    setSelectedFolder('');
    setStatus('ACTIVE');
    setResetDateTimeInput('2026-09-19 21:00');
    setExpiration('');
    setNotes('');
  };

  const handleDeleteAccount = (id: string, name: string) => {
    Alert.alert('Delete Account', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAccount(id);
          setDetailModalVisible(false);
        },
      },
    ]);
  };

  const handleDeleteFolder = (id: string, name: string) => {
    Alert.alert('Delete Folder', `Delete folder "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (activeFolderFilter === name) setActiveFolderFilter('ALL');
          deleteFolder(id);
        },
      },
    ]);
  };

  const currentDetailAccount = accounts.find((a) => a.id === selectedAccount?.id) || selectedAccount;

  const renderItem = ({ item, index }: { item: Account; index: number }) => {
    const cooldownInfo = formatRemainingTime(item.resetAt);
    const isCooldown = item.status === 'COOLDOWN' && !cooldownInfo.isExpired;

    const showPass = !!visiblePasswords[item.id];
    const showKey = !!visibleApiKeys[item.id];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.provider}>{item.provider}</Text>
          <View style={styles.headerRight}>

            {/* Reorder Arrows */}
            <View style={styles.reorderContainer}>
              <TouchableOpacity
                disabled={index === 0}
                style={[styles.reorderBtn, index === 0 && styles.reorderDisabled]}
                onPress={() => reorderAccount(item.id, 'up')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="chevron-up" size={14} color={index === 0 ? '#3f3f46' : '#fafafa'} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={index === filteredAccounts.length - 1}
                style={[styles.reorderBtn, index === filteredAccounts.length - 1 && styles.reorderDisabled]}
                onPress={() => reorderAccount(item.id, 'down')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="chevron-down" size={14} color={index === filteredAccounts.length - 1 ? '#3f3f46' : '#fafafa'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.badge, isCooldown ? styles.cooldownBadge : styles.activeBadge]}>
              <Text style={[styles.badgeText, isCooldown ? styles.cooldownText : styles.activeText]}>
                {isCooldown ? 'COOLDOWN' : 'ACTIVE'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="create-outline" size={15} color="#fafafa" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => handleDeleteAccount(item.id, item.gmailUsername || item.email)}
            >
              <Ionicons name="trash-outline" size={15} color="#52525b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gmail Username */}
        <View style={styles.credentialRow}>
          <Ionicons name="mail-outline" size={13} color="#71717a" style={styles.credIcon} />
          <Text style={styles.emailText}>{item.gmailUsername || item.email}</Text>
        </View>

        {/* Gmail Password */}
        {item.gmailPassword && (
          <View style={styles.credentialRow}>
            <Ionicons name="lock-closed-outline" size={13} color="#71717a" style={styles.credIcon} />
            <Text style={styles.credText}>
              {showPass ? item.gmailPassword : '••••••••••••'}
            </Text>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setVisiblePasswords((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={14}
                color="#71717a"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* API Key */}
        {item.apiKey && (
          <View style={styles.credentialRow}>
            <Ionicons name="key-outline" size={13} color="#71717a" style={styles.credIcon} />
            <Text style={styles.credText}>
              {showKey ? item.apiKey : item.apiKey.slice(0, 4) + '••••••••••••'}
            </Text>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setVisibleApiKeys((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              <Ionicons
                name={showKey ? 'eye-off-outline' : 'eye-outline'}
                size={14}
                color="#71717a"
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.metaGrid}>
          <View style={styles.metaRow}>
            <Ionicons name="hardware-chip-outline" size={12} color="#71717a" style={styles.metaIcon} />
            <Text style={styles.metaText}>{item.model}</Text>
          </View>
          {item.folderId && (
            <View style={styles.metaRow}>
              <Ionicons name="folder-outline" size={12} color="#71717a" style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.folderId}</Text>
            </View>
          )}
          {isCooldown && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color="#f59e0b" style={styles.metaIcon} />
              <Text style={styles.cooldownValue}>Reset: {cooldownInfo.formatted}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ACCOUNTS</Text>
          <Text style={styles.subtitle}>{filteredAccounts.length} ACCOUNTS</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={20} color="#fafafa" />
        </TouchableOpacity>
      </View>

      {/* Embedded Folder Filter Bar */}
      <View style={styles.folderBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderScroll}>
          <TouchableOpacity
            style={[styles.folderChip, activeFolderFilter === 'ALL' && styles.folderChipActive]}
            onPress={() => setActiveFolderFilter('ALL')}
          >
            <Text style={[styles.folderChipText, activeFolderFilter === 'ALL' && styles.folderChipTextActive]}>
              ALL
            </Text>
          </TouchableOpacity>

          {folders.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.folderChip, activeFolderFilter === f.name && styles.folderChipActive]}
              onPress={() => setActiveFolderFilter(f.name)}
              onLongPress={() => handleDeleteFolder(f.id, f.name)}
            >
              <Ionicons name="folder-outline" size={12} color={activeFolderFilter === f.name ? '#fafafa' : '#71717a'} style={{ marginRight: 4 }} />
              <Text style={[styles.folderChipText, activeFolderFilter === f.name && styles.folderChipTextActive]}>
                {f.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addFolderChip}
            onPress={() => setFolderModalVisible(true)}
          >
            <Ionicons name="add" size={12} color="#71717a" style={{ marginRight: 2 }} />
            <Text style={styles.addFolderChipText}>FOLDER</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Accounts List */}
      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>NO ACCOUNTS IN THIS FOLDER</Text>
          </View>
        }
      />

      {/* ACCOUNT DETAIL VIEW MODAL */}
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
                    style={styles.detailEditBtn}
                    onPress={() => openEditModal(currentDetailAccount)}
                  >
                    <Ionicons name="create-outline" size={14} color="#fafafa" style={{ marginRight: 4 }} />
                    <Text style={styles.detailEditBtnText}>EDIT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailDeleteBtn}
                    onPress={() =>
                      handleDeleteAccount(
                        currentDetailAccount.id,
                        currentDetailAccount.gmailUsername || currentDetailAccount.email
                      )
                    }
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                    <Text style={styles.detailDeleteBtnText}>DELETE</Text>
                  </TouchableOpacity>

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

      {/* CREATE ACCOUNT MODAL */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NEW ACCOUNT</Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>PROVIDER</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Gemini, OpenAI, Anthropic"
                placeholderTextColor="#52525b"
                value={provider}
                onChangeText={setProvider}
              />

              <Text style={styles.label}>GMAIL USERNAME / EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="username@gmail.com"
                placeholderTextColor="#52525b"
                value={gmailUsername}
                onChangeText={setGmailUsername}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>GMAIL PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="App password or login pass"
                placeholderTextColor="#52525b"
                value={gmailPassword}
                onChangeText={setGmailPassword}
                secureTextEntry
              />

              <Text style={styles.label}>API KEY</Text>
              <TextInput
                style={styles.input}
                placeholder="AIzaSy... / sk-proj-..."
                placeholderTextColor="#52525b"
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
              />

              <Text style={styles.label}>MODEL</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Gemini 1.5 Flash, GPT-4o"
                placeholderTextColor="#52525b"
                value={selectedModel}
                onChangeText={setSelectedModel}
              />

              {folders.length > 0 && (
                <>
                  <Text style={styles.label}>ASSIGN TO FOLDER</Text>
                  <View style={styles.chipRow}>
                    {folders.map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[styles.chip, selectedFolder === f.name && styles.chipActive]}
                        onPress={() => setSelectedFolder(selectedFolder === f.name ? '' : f.name)}
                      >
                        <Text style={[styles.chipText, selectedFolder === f.name && styles.chipTextActive]}>
                          {f.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.label}>STATUS</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[styles.statusOption, status === 'ACTIVE' && styles.statusOptionActive]}
                  onPress={() => setStatus('ACTIVE')}
                >
                  <Text style={[styles.statusOptionText, status === 'ACTIVE' && styles.activeText]}>
                    ACTIVE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusOption, status === 'COOLDOWN' && styles.statusOptionCooldown]}
                  onPress={() => setStatus('COOLDOWN')}
                >
                  <Text style={[styles.statusOptionText, status === 'COOLDOWN' && styles.cooldownText]}>
                    COOLDOWN
                  </Text>
                </TouchableOpacity>
              </View>

              {status === 'COOLDOWN' && (
                <>
                  <Text style={styles.label}>QUOTA RESET DATE & TIME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD HH:MM (e.g. 2026-09-19 21:00)"
                    placeholderTextColor="#52525b"
                    value={resetDateTimeInput}
                    onChangeText={setResetDateTimeInput}
                  />
                  <Text style={styles.helperText}>Example: Sept 19 9pm → 2026-09-19 21:00</Text>
                </>
              )}

              <Text style={styles.label}>EXPIRATION DATE (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#52525b"
                value={expiration}
                onChangeText={setExpiration}
              />

              <Text style={styles.label}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Short note"
                placeholderTextColor="#52525b"
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  resetForm();
                  setCreateModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateAccount}>
                <Text style={styles.saveText}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT ACCOUNT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>EDIT ACCOUNT</Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>PROVIDER</Text>
              <TextInput
                style={styles.input}
                placeholder="Provider"
                placeholderTextColor="#52525b"
                value={provider}
                onChangeText={setProvider}
              />

              <Text style={styles.label}>GMAIL USERNAME / EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="username@gmail.com"
                placeholderTextColor="#52525b"
                value={gmailUsername}
                onChangeText={setGmailUsername}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>GMAIL PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#52525b"
                value={gmailPassword}
                onChangeText={setGmailPassword}
              />

              <Text style={styles.label}>API KEY</Text>
              <TextInput
                style={styles.input}
                placeholder="API Key"
                placeholderTextColor="#52525b"
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
              />

              <Text style={styles.label}>MODEL</Text>
              <TextInput
                style={styles.input}
                placeholder="Model name"
                placeholderTextColor="#52525b"
                value={selectedModel}
                onChangeText={setSelectedModel}
              />

              {folders.length > 0 && (
                <>
                  <Text style={styles.label}>FOLDER</Text>
                  <View style={styles.chipRow}>
                    {folders.map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[styles.chip, selectedFolder === f.name && styles.chipActive]}
                        onPress={() => setSelectedFolder(selectedFolder === f.name ? '' : f.name)}
                      >
                        <Text style={[styles.chipText, selectedFolder === f.name && styles.chipTextActive]}>
                          {f.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.label}>STATUS</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[styles.statusOption, status === 'ACTIVE' && styles.statusOptionActive]}
                  onPress={() => setStatus('ACTIVE')}
                >
                  <Text style={[styles.statusOptionText, status === 'ACTIVE' && styles.activeText]}>
                    ACTIVE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusOption, status === 'COOLDOWN' && styles.statusOptionCooldown]}
                  onPress={() => setStatus('COOLDOWN')}
                >
                  <Text style={[styles.statusOptionText, status === 'COOLDOWN' && styles.cooldownText]}>
                    COOLDOWN
                  </Text>
                </TouchableOpacity>
              </View>

              {status === 'COOLDOWN' && (
                <>
                  <Text style={styles.label}>QUOTA RESET DATE & TIME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD HH:MM (e.g. 2026-09-19 21:00)"
                    placeholderTextColor="#52525b"
                    value={resetDateTimeInput}
                    onChangeText={setResetDateTimeInput}
                  />
                  <Text style={styles.helperText}>Example: Sept 19 9pm → 2026-09-19 21:00</Text>
                </>
              )}

              <Text style={styles.label}>EXPIRATION DATE (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#52525b"
                value={expiration}
                onChangeText={setExpiration}
              />

              <Text style={styles.label}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Short note"
                placeholderTextColor="#52525b"
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  resetForm();
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEditAccount}>
                <Text style={styles.saveText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW FOLDER MODAL */}
      <Modal visible={folderModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NEW FOLDER</Text>

            <TextInput
              style={styles.input}
              placeholder="Folder Name"
              placeholderTextColor="#52525b"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setNewFolderName('');
                  setFolderModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateFolder}>
                <Text style={styles.saveText}>CREATE</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    paddingBottom: 12,
  },
  folderScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  folderChipActive: {
    borderColor: '#fafafa',
    backgroundColor: '#27272a',
  },
  folderChipText: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '500',
  },
  folderChipTextActive: {
    color: '#fafafa',
    fontWeight: '600',
  },
  addFolderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addFolderChipText: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reorderContainer: {
    flexDirection: 'column',
    marginRight: 4,
  },
  reorderBtn: {
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  reorderDisabled: {
    opacity: 0.2,
  },
  provider: {
    color: '#fafafa',
    fontSize: 15,
    fontWeight: '600',
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
  actionIconBtn: {
    padding: 2,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  credIcon: {
    marginRight: 6,
    width: 14,
  },
  emailText: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '500',
  },
  credText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 2,
  },
  metaGrid: {
    gap: 6,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    color: '#71717a',
    fontSize: 11,
  },
  cooldownValue: {
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
  modalTitle: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
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
  detailMetaLabel: {
    color: '#71717a',
    fontSize: 12,
  },
  detailMetaValue: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '500',
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
    gap: 10,
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  detailEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  detailEditBtnText: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '600',
  },
  detailDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  detailDeleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  detailCloseBtn: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
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
  helperText: {
    color: '#52525b',
    fontSize: 10,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    color: '#fafafa',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: '#fafafa',
    backgroundColor: '#27272a',
  },
  chipText: {
    color: '#71717a',
    fontSize: 11,
  },
  chipTextActive: {
    color: '#fafafa',
    fontWeight: '600',
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statusOption: {
    flex: 1,
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  statusOptionCooldown: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525b',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveText: {
    color: '#09090b',
    fontSize: 12,
    fontWeight: '700',
  },
});