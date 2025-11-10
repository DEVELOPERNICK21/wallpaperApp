import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    photoURL: '',
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('Users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          setFormData({
            displayName: data?.displayName || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: data?.phone || '',
            bio: data?.bio || '',
            location: data?.location || '',
            website: data?.website || '',
            photoURL: data?.photoURL || currentUser.photoURL || '',
          });
          setSelectedImage(data?.photoURL || currentUser.photoURL || null);
        } else {
          setFormData(prev => ({
            ...prev,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
          }));
          setSelectedImage(currentUser.photoURL || null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Select Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => openCamera(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => openGallery(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        saveToPhotos: false,
        includeBase64: false,
      },
      response => {
        handleImageResponse(response);
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
        // This ensures we get a local file path that can be accessed
        selectionLimit: 1,
      },
      response => {
        handleImageResponse(response);
      },
    );
  };

  const handleImageResponse = (response: any) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'Failed to pick image');
    } else if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      console.log('📷 Image picker response:', {
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      });

      // Store the original URI from the picker
      setSelectedImage(asset.uri);
    }
  };

  const copyFileToLocalCache = async (uri: string): Promise<string> => {
    try {
      console.log('📂 Copying file to local cache...');
      const timestamp = Date.now();
      const filename = `temp_profile_${timestamp}.jpg`;
      const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

      // If it's a content URI (Android), copy it
      if (uri.startsWith('content://')) {
        console.log('📱 Copying from content URI to:', destPath);
        await RNFS.copyFile(uri, destPath);
        console.log('✅ File copied to cache');
        return destPath;
      }

      // If it's already a file path, just remove file:// prefix
      const filePath = uri.replace('file://', '');

      // Check if file exists
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        throw new Error(`File does not exist at path: ${filePath}`);
      }

      console.log('✅ File exists at:', filePath);
      return filePath;
    } catch (error) {
      console.error('❌ Error copying file:', error);
      throw error;
    }
  };

  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    let tempFilePath: string | null = null;

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      setUploadingPhoto(true);
      console.log('📸 Starting image upload...');
      console.log('📱 Platform:', Platform.OS);
      console.log('🖼️ Original URI:', imageUri);

      // Get a proper file path that Firebase Storage can access
      const filePath = await copyFileToLocalCache(imageUri);
      tempFilePath = filePath.startsWith(RNFS.CachesDirectoryPath)
        ? filePath
        : null;

      console.log('✅ File ready for upload:', filePath);

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `profile_photos/${currentUser.uid}_${timestamp}.jpg`;
      const reference = storage().ref(filename);

      console.log('☁️ Uploading to Firebase Storage:', filename);

      try {
        // Upload the file with metadata
        await reference.putFile(filePath, {
          contentType: 'image/jpeg',
        });

        console.log('✅ Upload complete, getting download URL...');

        // Get the download URL
        const downloadURL = await reference.getDownloadURL();
        console.log('🎉 Image uploaded successfully!');
        console.log('🔗 Download URL:', downloadURL);

        // Clean up temp file
        if (tempFilePath) {
          try {
            await RNFS.unlink(tempFilePath);
            console.log('🧹 Cleaned up temp file');
          } catch (cleanupError) {
            console.log('⚠️ Could not clean up temp file:', cleanupError);
          }
        }

        return downloadURL;
      } catch (uploadError: any) {
        console.error('❌ putFile error:', uploadError);
        console.error('❌ Error details:', {
          code: uploadError.code,
          message: uploadError.message,
          filePath: filePath,
          originalUri: imageUri,
        });
        throw uploadError;
      }
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);

      // Clean up temp file on error
      if (tempFilePath) {
        try {
          await RNFS.unlink(tempFilePath);
          console.log('🧹 Cleaned up temp file after error');
        } catch (cleanupError) {
          console.log('⚠️ Could not clean up temp file:', cleanupError);
        }
      }

      // Show more specific error message
      let errorMessage = 'Failed to upload image. ';
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Storage permissions denied.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was canceled.';
      } else if (error.code === 'storage/unknown') {
        errorMessage += 'Unknown error occurred.';
      } else if (
        error.code === 'storage/object-not-found' ||
        error.code === '-object-not-found'
      ) {
        errorMessage +=
          'File not found. The image may have been moved or deleted.';
      } else if (error.message) {
        errorMessage += error.message;
      }

      Alert.alert('Upload Error', errorMessage);
      throw error;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      console.log('💾 Starting profile save...');
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      let photoURL = formData.photoURL;

      // Upload image if a new one was selected
      if (
        selectedImage &&
        !selectedImage.startsWith('http') &&
        selectedImage !== formData.photoURL
      ) {
        console.log('📤 New image detected, uploading...');
        console.log('Selected image:', selectedImage);
        console.log('Current photoURL:', formData.photoURL);

        try {
          photoURL = await uploadImageToStorage(selectedImage);
          console.log('✅ Image uploaded, new URL:', photoURL);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          // If image upload fails, ask user if they want to continue without photo
          Alert.alert(
            'Image Upload Failed',
            'The profile photo could not be uploaded. Do you want to save other changes without updating the photo?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setSaving(false),
              },
              {
                text: 'Save Without Photo',
                onPress: async () => {
                  await saveProfileData(formData.photoURL);
                },
              },
            ],
          );
          return;
        }
      } else {
        console.log('ℹ️ No new image to upload');
      }

      await saveProfileData(photoURL);
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      Alert.alert(
        'Error',
        `Failed to update profile: ${error.message || 'Please try again.'}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const saveProfileData = async (photoURL: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      console.log('💾 Saving to Firestore...');
      // Update Firestore
      await firestore().collection('Users').doc(currentUser.uid).set(
        {
          displayName: formData.displayName,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          photoURL: photoURL,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );
      console.log('✅ Firestore updated');

      console.log('🔐 Updating Firebase Auth profile...');
      // Update Firebase Auth profile
      await currentUser.updateProfile({
        displayName: formData.displayName,
        photoURL: photoURL,
      });
      console.log('✅ Firebase Auth updated');

      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('❌ Error saving profile data:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}>
            {saving ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Profile Photo Section */}
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Profile Photo</Text>
              <View style={styles.photoContainer}>
                {selectedImage ? (
                  <Image source={{uri: selectedImage}} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>
                      {formData.displayName
                        ? formData.displayName
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : '👤'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleImagePicker}
                  disabled={uploadingPhoto}>
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.changePhotoIcon}>📷</Text>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.changePhotoTextButton}
                onPress={handleImagePicker}
                disabled={uploadingPhoto}>
                <Text style={styles.changePhotoText}>
                  {selectedImage ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                {uploadingPhoto
                  ? 'Uploading...'
                  : 'Tap to select from gallery or take a photo'}
              </Text>
            </View>

            {/* Display Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.displayName && styles.inputError]}
                value={formData.displayName}
                onChangeText={text =>
                  setFormData(prev => ({...prev, displayName: text}))
                }
                placeholder="Enter your full name"
                placeholderTextColor="#64748b"
              />
              {errors.displayName && (
                <Text style={styles.errorText}>{errors.displayName}</Text>
              )}
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor="#64748b"
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={text =>
                  setFormData(prev => ({...prev, phone: text}))
                }
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={text =>
                  setFormData(prev => ({...prev, bio: text}))
                }
                placeholder="Tell us about yourself..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.charCount}>{formData.bio.length}/200</Text>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={text =>
                  setFormData(prev => ({...prev, location: text}))
                }
                placeholder="City, Country"
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={[styles.input, errors.website && styles.inputError]}
                value={formData.website}
                onChangeText={text =>
                  setFormData(prev => ({...prev, website: text}))
                }
                placeholder="https://example.com"
                placeholderTextColor="#64748b"
                keyboardType="url"
                autoCapitalize="none"
              />
              {errors.website && (
                <Text style={styles.errorText}>{errors.website}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#f8fafc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  saveButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f8fafc',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#1a1f2e',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
  },
  charCount: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'right',
  },
  // Profile Photo Styles
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6366f1',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#475569',
  },
  photoPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  changePhotoIcon: {
    fontSize: 18,
  },
  changePhotoTextButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  changePhotoText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  photoHint: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default EditProfileScreen;
