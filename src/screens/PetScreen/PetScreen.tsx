import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from '../../component/Header/CommonHeader';
import {PetService, PetState} from '../../services/PetService';
import {LiveActivityService} from '../../services/LiveActivityService';
import {colors} from '../../assets/color';
import {width} from '../../assets/string.tsx';
import fonts from '../../assets/fonts/index.js';

const PetScreen: React.FC = () => {
  const navigation = useNavigation();
  const [petState, setPetState] = useState<PetState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [petName, setPetName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPetState = useCallback(async () => {
    setLoading(true);
    try {
      const state = await PetService.getPetState();
      if (state) {
        setPetState(state);
        setPetName(state.name);
      } else {
        initializePet();
      }
    } catch (error) {
      console.error('Error loading pet state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPetState();
  }, [loadPetState]);

  useEffect(() => {
    if (!petState) return;
    const cleanup = PetService.startDecayTimer(updatedState => {
      setPetState(updatedState);
    });
    return cleanup;
  }, [petState]);

  const initializePet = () => {
    Alert.alert(
      'Welcome!',
      'Let\'s set up your virtual pet. Choose a name and type.',
      [
        {
          text: 'Set Up',
          onPress: () => {
            setPetState({
              ...PetService.initializePet('Pet', 'cat'),
              name: 'Pet',
              type: 'cat',
            });
            setPetName('Pet');
          },
        },
      ],
    );
  };

  const handleFeed = async () => {
    setActionLoading(true);
    try {
      const updated = await PetService.feedPet();
      if (updated) {
        setPetState(updated);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to feed pet');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlay = async () => {
    setActionLoading(true);
    try {
      const updated = await PetService.playWithPet();
      if (updated) {
        setPetState(updated);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play with pet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRest = async () => {
    setActionLoading(true);
    try {
      const updated = await PetService.restPet();
      if (updated) {
        setPetState(updated);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to rest pet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!petName.trim()) {
      Alert.alert('Error', 'Pet name cannot be empty');
      return;
    }
    const success = await PetService.updatePetName(petName.trim());
    if (success && petState) {
      setPetState({...petState, name: petName.trim()});
      setEditingName(false);
    }
  };

  const handleChangeType = async (type: PetState['type']) => {
    const success = await PetService.updatePetType(type);
    if (success && petState) {
      setPetState({...petState, type});
    }
  };

  const getPetEmoji = (type?: string) => {
    switch (type) {
      case 'cat':
        return '🐱';
      case 'dog':
        return '🐶';
      case 'rabbit':
        return '🐰';
      case 'bird':
        return '🐦';
      default:
        return '🐾';
    }
  };

  const getPetStatus = () => {
    if (!petState) return 'Unknown';
    const {hunger, happiness, energy} = petState;
    if (hunger < 30) return 'Hungry';
    if (happiness < 30) return 'Sad';
    if (energy < 30) return 'Tired';
    return 'Happy';
  };

  const headerData = {
    headerTitle: 'Virtual Pet',
    showLeftIcon: false,
    showRightIcon: false,
    showBackIcon: true,
    onBackPress: () => navigation.goBack(),
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CommonHeader data={headerData} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors?.primaryColor} />
        </View>
      </View>
    );
  }

  if (!petState) {
    return (
      <View style={styles.container}>
        <CommonHeader data={headerData} />
        <View style={styles.centered}>
          <Text style={styles.setupText}>Set up your pet to get started!</Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => {
              PetService.initializePet('Pet', 'cat').then(state => {
                setPetState(state);
                setPetName(state.name);
              });
            }}>
            <Text style={styles.setupButtonText}>Initialize Pet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const {hunger, happiness, energy, type} = petState;
  const status = getPetStatus();

  return (
    <View style={styles.container}>
      <CommonHeader data={headerData} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.petDisplay}>
          <Text style={styles.petEmoji}>{getPetEmoji(type)}</Text>
          {editingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={petName}
                onChangeText={setPetName}
                placeholder="Pet name"
                autoFocus
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPetName(petState.name);
                  setEditingName(false);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.petName}>{petState.name}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingName(true)}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.petStatus}>{status}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBar}>
            <Text style={styles.statLabel}>Hunger</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  {width: `${hunger}%`, backgroundColor: hunger < 30 ? '#ef4444' : '#10b981'},
                ]}
              />
            </View>
            <Text style={styles.statValue}>{hunger}/100</Text>
          </View>

          <View style={styles.statBar}>
            <Text style={styles.statLabel}>Happiness</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${happiness}%`,
                    backgroundColor: happiness < 30 ? '#ef4444' : '#10b981',
                  },
                ]}
              />
            </View>
            <Text style={styles.statValue}>{happiness}/100</Text>
          </View>

          <View style={styles.statBar}>
            <Text style={styles.statLabel}>Energy</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  {width: `${energy}%`, backgroundColor: energy < 30 ? '#ef4444' : '#f59e0b'},
                ]}
              />
            </View>
            <Text style={styles.statValue}>{energy}/100</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.feedButton]}
            onPress={handleFeed}
            disabled={actionLoading}>
            <Text style={styles.actionButtonIcon}>🍎</Text>
            <Text style={styles.actionButtonText}>Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlay}
            disabled={actionLoading || energy < 10}>
            <Text style={styles.actionButtonIcon}>🎾</Text>
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.restButton]}
            onPress={handleRest}
            disabled={actionLoading}>
            <Text style={styles.actionButtonIcon}>😴</Text>
            <Text style={styles.actionButtonText}>Rest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Pet Type</Text>
          <View style={styles.typeButtons}>
            {(['cat', 'dog', 'rabbit', 'bird'] as PetState['type'][]).map(petType => (
              <TouchableOpacity
                key={petType}
                style={[
                  styles.typeButton,
                  type === petType && styles.typeButtonActive,
                ]}
                onPress={() => handleChangeType(petType)}>
                <Text style={styles.typeButtonEmoji}>{getPetEmoji(petType)}</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    type === petType && styles.typeButtonTextActive,
                  ]}>
                  {petType.charAt(0).toUpperCase() + petType.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {Platform.OS === 'ios' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Your pet appears on Dynamic Island when enabled. Long-press to interact
              quickly!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: width / 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  setupText: {
    fontSize: 16,
    fontFamily: fonts?.PoppinsMedium,
    color: colors?.greyColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  setupButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
  },
  setupButtonText: {
    fontSize: 16,
    fontFamily: fonts?.PoppinsSemiBold,
    color: colors?.white,
  },
  petDisplay: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  petEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 24,
    fontFamily: fonts?.PoppinsBold,
    color: colors?.black,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 18,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors?.greyColor,
    borderRadius: 8,
    padding: 8,
    fontSize: 18,
    fontFamily: fonts?.PoppinsMedium,
    minWidth: 120,
    marginRight: 8,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors?.primaryColor,
    borderRadius: 8,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsSemiBold,
    color: colors?.white,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors?.greyColor,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsMedium,
    color: colors?.white,
  },
  petStatus: {
    fontSize: 16,
    fontFamily: fonts?.PoppinsMedium,
    color: colors?.greyColor,
  },
  statsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  statBar: {
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsMedium,
    color: colors?.black,
    marginBottom: 4,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors?.greyColor + '40',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 12,
    fontFamily: fonts?.PoppinsRegular,
    color: colors?.greyColor,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
  },
  feedButton: {
    backgroundColor: '#10b981' + '20',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  playButton: {
    backgroundColor: '#3b82f6' + '20',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  restButton: {
    backgroundColor: '#f59e0b' + '20',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsSemiBold,
    color: colors?.black,
  },
  typeContainer: {
    marginTop: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsMedium,
    color: colors?.black,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors?.greyColor,
    backgroundColor: colors?.greyColor + '20',
  },
  typeButtonActive: {
    borderColor: colors?.primaryColor,
    backgroundColor: colors?.primaryColor + '20',
  },
  typeButtonEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: fonts?.PoppinsMedium,
    color: colors?.greyColor,
  },
  typeButtonTextActive: {
    color: colors?.primaryColor,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  infoText: {
    fontSize: 12,
    fontFamily: fonts?.PoppinsRegular,
    color: '#0369a1',
    textAlign: 'center',
  },
});

export default PetScreen;
