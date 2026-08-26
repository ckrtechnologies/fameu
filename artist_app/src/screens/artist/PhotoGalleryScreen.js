import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator, Alert, Modal, PermissionsAndroid, Platform , RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';
import { useGetProfileQuery, useUpsertProfileMutation } from '../../services/profileApi';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { uploadFileWithProgress } from '../../utils/uploadUtils';
import ProgressBar from '../../components/core/ProgressBar';
import { parseArray } from '../../utils/dataUtils';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 32 - (COLUMN_COUNT - 1) * 8) / COLUMN_COUNT;

export default function PhotoGalleryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: profileResponse, isLoading: isLoadingProfile , isFetching, refetch} = useGetProfileQuery();
  const [upsertProfile] = useUpsertProfileMutation();
  const token = useSelector(state => state.auth.token);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const photos = React.useMemo(() => {
    return parseArray(profileResponse?.data?.photo_urls).filter(url => url && typeof url === 'string' && url.trim().length > 0);
  }, [profileResponse?.data?.photo_urls]);
  const artistId = profileResponse?.data?.id;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleDeletePhoto = (index) => {
    GlobalAlert.show('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          const updatedPhotos = photos.filter((_, i) => i !== index);
          try {
            await upsertProfile({ photo_urls: updatedPhotos }).unwrap();
          } catch (error) {
            showError('', 'Failed to delete photo.');
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
    GlobalAlert.show(
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
                  showError('Permission Denied', "Camera permission is required to take photos");
                }
              } catch (err) {
                console.error(err);
                showError('Error', err?.message || 'Failed to request camera permission');
              }
            } else {
              launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1440, maxHeight: 1440 }, handleImageUpload);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo', selectionLimit: 5, quality: 0.8, maxWidth: 1440, maxHeight: 1440 }, handleImageUpload);
          }
        }
      ]
    );

    const handleImageUpload = async (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        showError('', response.errorMessage);
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
          setIsUploading(true);
          setUploadProgress(0);
          await uploadFileWithProgress('/artist_app/profile/upload', formData, (progress) => {
            setUploadProgress(progress);
          }, token);
          showSuccess('', 'Photos uploaded successfully!');
          refetch();
        } catch (error) {
          console.error('Upload photo error:', error);
          const errMsg = error?.message || 'Failed to upload photos';
          showError('', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        } finally {
          setIsUploading(false);
        }
      }
    };
  };

  const openModal = (index) => {
    setSelectedPhotoIndex(index);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={[styles.imageContainer, isUploading && { opacity: 0.5 }]} onPress={() => !isUploading && openModal(index)} disabled={isUploading}>
      <ImageWithFallback source={{ uri: item }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDeletePhoto(index)}
        disabled={isUploading}
      >
        <Icon name="trash-outline" size={16} color={isUploading ? "#aaa" : "#fff"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Photo Gallery"
        subtitle={`${photos.length} portfolio photos`}
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
        rightActions={
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.borderLight, width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }]} 
            onPress={handlePickImage} 
            disabled={isUploading}
          >
            <Icon name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

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
              renderItem={renderItem}
              keyExtractor={(item, index) => `gallery-${index}-${item}`}
              refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
              numColumns={COLUMN_COUNT}
              contentContainerStyle={styles.listContent}
              onScroll={onScroll}
              scrollEventThrottle={16}
              columnWrapperStyle={styles.row}
            />
          )}

          <View style={{ position: 'absolute', bottom: 100, left: 16, right: 16 }}>
            {isUploading && <ProgressBar progress={uploadProgress} />}
          </View>
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
            initialScrollIndex={selectedPhotoIndex >= 0 && selectedPhotoIndex < photos.length ? selectedPhotoIndex : 0}
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
            keyExtractor={(item, index) => `modal-${index}-${item}`}
            renderItem={({ item }) => (
              <View style={styles.fullScreenImageContainer}>
                <ImageWithFallback source={{ uri: item }} style={styles.fullScreenImage} resizeMode="contain" />
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

const getStyles = (colors) => StyleSheet.create({
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
    color: colors.textMutedLight,
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
