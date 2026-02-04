import AsyncStorage from '@react-native-async-storage/async-storage';
import {LiveActivityService} from './LiveActivityService';
import {AppState} from 'react-native';

const PET_STATE_KEY = '@wallpe:petState';
const PET_DECAY_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export interface PetState {
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  name: string;
  type: 'cat' | 'dog' | 'rabbit' | 'bird';
  lastFed?: number;
  lastPlayed?: number;
  createdAt: number;
}

const DEFAULT_PET_STATE: PetState = {
  hunger: 50,
  happiness: 50,
  energy: 50,
  name: 'Pet',
  type: 'cat',
  createdAt: Date.now(),
};

export const PetService = {
  async initializePet(name: string, type: PetState['type']): Promise<PetState> {
    const petState: PetState = {
      ...DEFAULT_PET_STATE,
      name,
      type,
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(PET_STATE_KEY, JSON.stringify(petState));
    await LiveActivityService.setPetName(name);
    await LiveActivityService.setPetType(type);
    return petState;
  },

  async getPetState(): Promise<PetState | null> {
    try {
      const stored = await AsyncStorage.getItem(PET_STATE_KEY);
      if (!stored) return null;
      const state = JSON.parse(stored) as PetState;
      return await this.applyDecay(state);
    } catch (_) {
      return null;
    }
  },

  async savePetState(state: PetState): Promise<void> {
    await AsyncStorage.setItem(PET_STATE_KEY, JSON.stringify(state));
  },

  async applyDecay(state: PetState): Promise<PetState> {
    const now = Date.now();
    const hoursSinceCreation = (now - state.createdAt) / (1000 * 60 * 60);
    const hoursSinceLastFed = state.lastFed
      ? (now - state.lastFed) / (1000 * 60 * 60)
      : hoursSinceCreation;
    const hoursSinceLastPlayed = state.lastPlayed
      ? (now - state.lastPlayed) / (1000 * 60 * 60)
      : hoursSinceCreation;

    let newState = {...state};

    newState.hunger = Math.max(0, newState.hunger - Math.floor(hoursSinceLastFed));
    newState.happiness = Math.max(
      0,
      newState.happiness - Math.floor(hoursSinceLastPlayed / 2),
    );
    newState.energy = Math.min(100, newState.energy + Math.floor(hoursSinceLastPlayed / 4));

    if (
      newState.hunger !== state.hunger ||
      newState.happiness !== state.happiness ||
      newState.energy !== state.energy
    ) {
      await this.savePetState(newState);
    }

    return newState;
  },

  async feedPet(): Promise<PetState | null> {
    const current = await this.getPetState();
    if (!current) return null;

    const newState: PetState = {
      ...current,
      hunger: Math.min(100, current.hunger + 30),
      lastFed: Date.now(),
    };

    await this.savePetState(newState);
    await LiveActivityService.feedPet();
    await LiveActivityService.updateLiveActivity();

    return newState;
  },

  async playWithPet(): Promise<PetState | null> {
    const current = await this.getPetState();
    if (!current) return null;

    const newState: PetState = {
      ...current,
      happiness: Math.min(100, current.happiness + 20),
      energy: Math.max(0, current.energy - 10),
      lastPlayed: Date.now(),
    };

    await this.savePetState(newState);
    await LiveActivityService.playWithPet();
    await LiveActivityService.updateLiveActivity();

    return newState;
  },

  async restPet(): Promise<PetState | null> {
    const current = await this.getPetState();
    if (!current) return null;

    const newState: PetState = {
      ...current,
      energy: Math.min(100, current.energy + 40),
    };

    await this.savePetState(newState);
    await LiveActivityService.restPet();
    await LiveActivityService.updateLiveActivity();

    return newState;
  },

  async updatePetName(name: string): Promise<boolean> {
    const current = await this.getPetState();
    if (!current) return false;

    const newState: PetState = {
      ...current,
      name,
    };

    await this.savePetState(newState);
    await LiveActivityService.setPetName(name);
    await LiveActivityService.updateLiveActivity();

    return true;
  },

  async updatePetType(type: PetState['type']): Promise<boolean> {
    const current = await this.getPetState();
    if (!current) return false;

    const newState: PetState = {
      ...current,
      type,
    };

    await this.savePetState(newState);
    await LiveActivityService.setPetType(type);
    await LiveActivityService.updateLiveActivity();

    return true;
  },

  startDecayTimer(callback: (state: PetState) => void): () => void {
    let intervalId: NodeJS.Timeout | null = null;

    const checkDecay = async () => {
      if (AppState.currentState === 'active') {
        const state = await this.getPetState();
        if (state) {
          callback(state);
          await LiveActivityService.updateLiveActivity();
        }
      }
    };

    intervalId = setInterval(checkDecay, PET_DECAY_INTERVAL);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  },
};
