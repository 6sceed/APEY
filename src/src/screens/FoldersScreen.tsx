import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppContext';
import { Folder } from '../types';

export default function FoldersScreen() {
  const { folders, accounts, addFolder, deleteFolder } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await addFolder(newFolderName.trim());
    setNewFolderName('');
    setModalVisible(false);
  };

  const handleDeleteFolder = (id: string, name: string) => {
    Alert.alert(
      'Delete Folder',
      `Delete "${name}"? Accounts will become unassigned.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteFolder(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Folder }) => {
    const realCount = accounts.filter((a) => a.folderId === item.name).length;

    return (
      <View style={styles.folderRow}>
        <View style={styles.folderLeft}>
          <Ionicons name="folder-outline" size={18} color="#71717a" style={styles.icon} />
          <Text style={styles.folderName}>{item.name}</Text>
        </View>
        <View style={styles.folderRight}>
          <Text style={styles.countText}>{realCount}</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => handleDeleteFolder(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={16} color="#52525b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>FOLDERS</Text>
          <Text style={styles.subtitle}>{folders.length} TOTAL</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fafafa" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>NO FOLDERS CREATED</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
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
                  setModalVisible(false);
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
    gap: 8,
  },
  folderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  folderName: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '500',
  },
  folderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  countText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 2,
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    color: '#fafafa',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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