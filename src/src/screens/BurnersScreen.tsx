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
import { Burner } from '../types';

const PRESET_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#a855f7', '#71717a'];

export default function BurnersScreen() {
  const { burners, addBurner, updateBurner, deleteBurner } = useAppData();

  // Modals state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBurner, setSelectedBurner] = useState<Burner | null>(null);

  // Form State
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [tag, setTag] = useState('1');
  const [tagColor, setTagColor] = useState('#22c55e');
  const [notes, setNotes] = useState('');

  // Password Visibility toggles for cards
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Sort burners by tag so "1" or "A" appears at top
  const sortedBurners = [...burners].sort((a, b) =>
    a.tag.localeCompare(b.tag, undefined, { numeric: true, sensitivity: 'base' })
  );

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

  const openEditModal = (burner: Burner) => {
    setSelectedBurner(burner);
    setGmail(burner.gmail);
    setPassword(burner.password);
    setTag(burner.tag);
    setTagColor(burner.tagColor || '#22c55e');
    setNotes(burner.notes || '');
    setEditModalVisible(true);
  };

  const handleCreateBurner = async () => {
    if (!gmail.trim()) {
      Alert.alert('Required', 'Gmail address is required');
      return;
    }

    await addBurner({
      gmail: gmail.trim(),
      password: password.trim(),
      tag: tag.trim() || '1',
      tagColor: tagColor || '#22c55e',
      notes: notes.trim() || undefined,
    });

    resetForm();
    setCreateModalVisible(false);
  };

  const handleSaveEditBurner = async () => {
    if (!selectedBurner) return;
    if (!gmail.trim()) {
      Alert.alert('Required', 'Gmail address is required');
      return;
    }

    await updateBurner(selectedBurner.id, {
      gmail: gmail.trim(),
      password: password.trim(),
      tag: tag.trim() || '1',
      tagColor: tagColor || '#22c55e',
      notes: notes.trim() || undefined,
    });

    resetForm();
    setEditModalVisible(false);
  };

  const handleDeleteBurner = (id: string, gmailAddr: string) => {
    Alert.alert('Delete Burner', `Delete burner "${gmailAddr}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBurner(id);
          setEditModalVisible(false);
        },
      },
    ]);
  };

  const resetForm = () => {
    setSelectedBurner(null);
    setGmail('');
    setPassword('');
    setTag('1');
    setTagColor('#22c55e');
    setNotes('');
  };

  const renderItem = ({ item }: { item: Burner }) => {
    const showPass = !!visiblePasswords[item.id];
    const badgeColor = item.tagColor || '#22c55e';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.gmailRow}>
            <Ionicons name="flame-outline" size={15} color="#71717a" style={styles.cardIcon} />
            <Text style={styles.gmailText}>{item.gmail}</Text>
          </View>
          <View style={[styles.tagBadge, { backgroundColor: badgeColor + '22', borderColor: badgeColor }]}>
            <Text style={[styles.tagBadgeText, { color: badgeColor }]}>{item.tag}</Text>
          </View>
        </View>

        {item.password ? (
          <View style={styles.passwordRow}>
            <Ionicons name="lock-closed-outline" size={13} color="#71717a" style={styles.credIcon} />
            <Text style={styles.passwordText}>
              {showPass ? item.password : '••••••••••••'}
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
        ) : null}

        {item.notes ? (
          <View style={styles.notesPreview}>
            <Text style={styles.notesPreviewText} numberOfLines={1}>
              {item.notes}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>BURNERS</Text>
          <Text style={styles.subtitle}>{sortedBurners.length} BURNER ACCOUNTS</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={20} color="#fafafa" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedBurners}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>NO BURNERS ADDED</Text>
          </View>
        }
      />

      {/* CREATE BURNER MODAL */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NEW BURNER</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>TAG / SORT ORDER (e.g. 1, A, Primary)</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#52525b"
                value={tag}
                onChangeText={setTag}
              />

              <Text style={styles.label}>TAG COLOR</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      tagColor === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setTagColor(c)}
                  />
                ))}
              </View>

              <Text style={styles.label}>GMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="burner@gmail.com"
                placeholderTextColor="#52525b"
                value={gmail}
                onChangeText={setGmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#52525b"
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.label}>NOTES (TYPE WHATEVER YOU WANT)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Free-form notes, recovery emails, app keys..."
                placeholderTextColor="#52525b"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
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
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateBurner}>
                <Text style={styles.saveText}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT & DETAIL BURNER MODAL */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>BURNER DETAILS & EDIT</Text>

            {copiedNotice && (
              <View style={styles.copiedBanner}>
                <Text style={styles.copiedBannerText}>COPIED {copiedNotice.toUpperCase()}</Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>TAG / SORT ORDER</Text>
              <TextInput
                style={styles.input}
                placeholder="Tag"
                placeholderTextColor="#52525b"
                value={tag}
                onChangeText={setTag}
              />

              <Text style={styles.label}>TAG COLOR</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      tagColor === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setTagColor(c)}
                  />
                ))}
              </View>

              <View style={styles.fieldHeaderRow}>
                <Text style={styles.label}>GMAIL ADDRESS</Text>
                <TouchableOpacity onPress={() => handleCopyNotice('Gmail')}>
                  <Text style={styles.copyInlineText}>COPY GMAIL</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Gmail"
                placeholderTextColor="#52525b"
                value={gmail}
                onChangeText={setGmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.fieldHeaderRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity onPress={() => handleCopyNotice('Password')}>
                  <Text style={styles.copyInlineText}>COPY PASS</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#52525b"
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.label}>NOTES (EDITABLE FREE-FORM)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Type whatever notes you want..."
                placeholderTextColor="#52525b"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={5}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              {selectedBurner && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteBurner(selectedBurner.id, selectedBurner.gmail)}
                >
                  <Text style={styles.deleteBtnText}>DELETE</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  resetForm();
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEditBurner}>
                <Text style={styles.saveText}>SAVE</Text>
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
  listContent: {
    padding: 20,
    gap: 10,
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
  gmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 6,
  },
  gmailText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  credIcon: {
    marginRight: 6,
  },
  passwordText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 2,
  },
  notesPreview: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1f1f23',
  },
  notesPreviewText: {
    color: '#71717a',
    fontSize: 11,
    fontStyle: 'italic',
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
    maxHeight: '85%',
  },
  modalTitle: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
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
  label: {
    color: '#52525b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  copyInlineText: {
    color: '#fafafa',
    fontSize: 10,
    fontWeight: '600',
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#fafafa',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 'auto',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
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
