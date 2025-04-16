import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TripActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onReplan: () => void;
  tripTitle: string;
}

const TripActionSheet: React.FC<TripActionSheetProps> = ({
  visible,
  onClose,
  onRename,
  onDuplicate,
  onReplan,
  tripTitle,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.actionSheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Trip Options</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {tripTitle}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onClose();
                  onRename();
                }}
              >
                <Ionicons name="text-outline" size={24} color="#6200ee" />
                <Text style={styles.actionText}>Rename Trip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onClose();
                  onDuplicate();
                }}
              >
                <Ionicons name="copy-outline" size={24} color="#6200ee" />
                <Text style={styles.actionText}>Duplicate Trip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onClose();
                  onReplan();
                }}
              >
                <Ionicons name="refresh-outline" size={24} color="#6200ee" />
                <Text style={styles.actionText}>Replan with AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  cancelButton: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f44336',
    textAlign: 'center',
  },
});

export default TripActionSheet; 