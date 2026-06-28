import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator, Alert, Modal, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { colors, typography } from '../../theme/theme';
import { useGetProfileQuery, useUploadMediaMutation, useUpsertProfileMutation } from '../../services/profileApi';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 32 - (COLUMN_COUNT - 1) * 8) / COLUMN_COUNT;

export default function PhotoGalleryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [upsertProfile] = useUpsertProfileMutation();

  const photos = profileResponse?.data?.photo_urls || [];
  const artistId = profileResponse?.data?.id;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleDeletePhoto = (index) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          const updatedPhotos = photos.filter((_, i) => i !== index);
          try {
            await upsertProfile({ photo_urls: updatedPhotos }).unwrap();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete photo.');
          }
        }
      }
    ]);
  };

  const handleNext = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      const nextIndex = selectedPhotoIndex + 1;
      setSelectedPhotoIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const handlePrev = () => {
    if (selectedPhotoIndex > 0) {
      const prevIndex = selectedPhotoIndex - 1;
      setSelectedPhotoIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handlePickImage = () => {
    Alert.alert(
      'Upload Photos',
      'Choose an option to upload your photos',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            if (Platform.OS === 'android') {
              try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  launchCamera({ mediaType: 'photo', quality: 0.8 }, handleImageUpload);
                } else {
                  Alert.alert("Error", "Camera permission denied");
                }
              } catch (err) {
                console.warn(err);
              }
            } else {
              launchCamera({ mediaType: 'photo', quality: 0.8 }, handleImageUpload);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo', selectionLimit: 5, quality: 0.8 }, handleImageUpload);
          }
        }
      ]
    );

    const handleImageUpload = async (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const formData = new FormData();
        
        response.assets.forEach((asset) => {
          formData.append('photos', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `photo_${Date.now()}.jpg`,
          });
        });

        try {
          await uploadMedia(formData).unwrap();
          Alert.alert('Success', 'Photos uploaded successfully!');
        } catch (error) {
          console.error('Upload photo error:', error);
          const errMsg = error?.data?.error || error?.message || 'Failed to upload photos';
          Alert.alert('Error', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        }
      }
    };
  };

  const openModal = (index) => {
    setSelectedPhotoIndex(index);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={styles.imageContainer} onPress={() => openModal(index)}>
      <Image source={{ uri: item }} style={styles.image} />
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDeletePhoto(index)}
      >
        <Icon name="trash-outline" size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoadingProfile ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.container}>
          {photos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="images-outline" size={64} color={colors.textMutedLight} />
              <Text style={styles.emptyText}>No photos yet</Text>
              <Text style={styles.emptySubtext}>Upload headshots and portfolio photos to complete your profile.</Text>
            </View>
          ) : (
            <FlatList
              data={photos}
              keyExtractor={(item, index) => index.toString()}
              numColumns={COLUMN_COUNT}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
            />
          )}

          <TouchableOpacity 
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
            onPress={handlePickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.backgroundLight} />
            ) : (
              <>
                <Icon name="cloud-upload-outline" size={24} color={colors.backgroundLight} style={{ marginRight: 8 }} />
                <Text style={styles.uploadButtonText}>Upload Photos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={[styles.closeModalBtn, { top: insets.top + 10 }]} onPress={() => setModalVisible(false)}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <FlatList
            ref={flatListRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedPhotoIndex}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
              });
            }}
            onViewableItemsChanged={({ viewableItems }) => {
              if (viewableItems.length > 0) {
                setSelectedPhotoIndex(viewableItems[0].index);
              }
            }}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.fullScreenImageContainer}>
                <Image source={{ uri: item }} style={styles.fullScreenImage} resizeMode="contain" />
              </View>
            )}
          />
          {selectedPhotoIndex > 0 && (
            <TouchableOpacity style={styles.leftArrow} onPress={handlePrev}>
              <Icon name="chevron-back" size={40} color="#fff" />
            </TouchableOpacity>
          )}
          {selectedPhotoIndex < photos.length - 1 && (
            <TouchableOpacity style={styles.rightArrow} onPress={handleNext}>
              <Icon name="chevron-forward" size={40} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondaryLight,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'flex-start',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginBottom: 8,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    ...typography.h4,
    color: colors.backgroundLight,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImageContainer: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  leftArrow: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -20,
    zIndex: 10,
    padding: 10,
  },
  rightArrow: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -20,
    zIndex: 10,
    padding: 10,
  },
});
