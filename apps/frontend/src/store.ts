import create from 'zustand';

export type AppState = {
  playerName: string;
  setPlayerName: (playerName: string) => void;
};

export const useAppStore = create<AppState>((set) => {
  return {
    playerName: '',
    setPlayerName: (playerName: string) => set({playerName}),
  };
});