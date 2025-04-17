import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ModalConfirmActions {
  Default = 'default',
  ConfirmDeleteCard = 'confirmDeleteCard',
}

export enum ModalCancelActions {
  Default = 'default',
}

// Define the shape of your config state, including Gemini
interface SidePanelConfig {
  provider: 'lmstudio' | 'groq' | 'gemini' | string; // Add 'gemini'
  // ... other provider configs (e.g., lmStudioUrl, groqApiKey)
  geminiApiKey?: string; // Add Gemini API Key field
  // ... other settings like model, persona, etc.
}

interface SidePanelState {
  config: SidePanelConfig;
  // You might have other top-level state properties here
  isOpen: boolean; // Assuming isOpen belongs here based on previous code
}

const initialState: SidePanelState = {
  isOpen: false, // Initialize isOpen here
  config: {
    provider: 'lmstudio', // or your default
    // ... initial values for other configs
    geminiApiKey: undefined,
    // ...
  },
  // ...
};

export const sidePanelSlice = createSlice({
  name: 'sidePanel',
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<string>) => {
      state.config.provider = action.payload;
    },

    setGeminiApiKey: (state, action: PayloadAction<string>) => {
      state.config.geminiApiKey = action.payload;
    },

    // Action to load config (example)
    loadConfig: (state, action: PayloadAction<Partial<SidePanelConfig>>) => {
        state.config = { ...state.config, ...action.payload };
    }
},
});

export const {
  setProvider,
  setGeminiApiKey,
  loadConfig, // Ensure loadConfig or similar exists and handles geminiApiKey
  // ... export other actions ...
} = sidePanelSlice.actions;

// Keep the export for the 'sidePanel' slice reducer
export const reducer = sidePanelSlice.reducer;

// Make sure there isn't another "export const reducer = ..." line anywhere else in this file.
