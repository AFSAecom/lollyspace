import { create } from 'zustand';

interface VolumeState {
  volume: number;
  increase: () => void;
  decrease: () => void;
}

export const useVolumeStore = create<VolumeState>((set) => ({
  volume: 50,
  increase: () => set((s) => ({ volume: s.volume + 10 })),
  decrease: () => set((s) => ({ volume: s.volume - 10 })),
}));
