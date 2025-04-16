import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContextType, useAuthContext } from '../contexts/AuthContext';
import {
  getProfile,
  updatePersonalInfo,
  savePreferences,
  changePassword,
  toggle2FA,
  logoutAllDevices,
  deleteAccount,
} from '../services/profileService';

const MyProfileScreen = () => {
  const { user, setUser, logout } = useAuthContext() as AuthContextType;
  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    fullName: '',
    phone: '',
    country: '',
    language: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getProfile();
        setProfileInfo({
          fullName: data.fullName,
          phone: data.phone,
          country: data.country,
          language: data.language,
        });
        setUser(data);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveInfo = async () => {
    setLoading(true);
    try {
      const updatedUser = await updatePersonalInfo(profileInfo);
      setUser(updatedUser);
      Toast.show({ type: 'success', text1: '✅ Info Saved!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: '❌ Failed to update info' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount(password);
              logout();
              Toast.show({ type: 'success', text1: 'Account deleted successfully' });
            } catch (error) {
              Toast.show({ type: 'error', text1: '❌ Failed to delete account' });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={profileInfo.fullName}
        onChangeText={(text) => setProfileInfo({ ...profileInfo, fullName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={profileInfo.phone}
        onChangeText={(text) => setProfileInfo({ ...profileInfo, phone: text })}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={profileInfo.country}
        onChangeText={(text) => setProfileInfo({ ...profileInfo, country: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Language"
        value={profileInfo.language}
        onChangeText={(text) => setProfileInfo({ ...profileInfo, language: text })}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveInfo} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Info'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAccount('user-password')}
      >
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyProfileScreen;