import { useEffect, useState } from 'react';

import { useConfig } from '../ConfigContext';
import { GEMINI_URL, GROQ_URL, OPENAI_URL } from '../constants';
import { useInterval } from '@chakra-ui/react';

const fetchDataSilently = async (url: string, params = {}) => {
  try {
    const res = await fetch(url, params);
    // Check if the response is ok (status in the range 200-299)
    if (!res.ok) {
      // Optionally log the error or status code
      // console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return undefined; // Return undefined if response is not OK
    }
    const data = await res.json(); // Use await here
    return data;
  } catch (error) {
    // Optionally log the error
    // console.error(`Error fetching ${url}:`, error);
    return undefined;
  }
};

export const useUpdateModels = () => {
  const { config, updateConfig } = useConfig();

  useInterval(() => {
    const fetchModels = async () => {
      let combinedModels: any[] = [];
      const connectionStatusUpdates: Record<string, boolean> = {};

      // Ollama
      if (config?.ollamaUrl) {
        const ollamaModels = await fetchDataSilently(`${config.ollamaUrl}/api/tags`);
        if (ollamaModels?.models) {
          const parsedModels = ollamaModels.models.map((m: any) => ({ ...m, id: m.name, host: 'ollama' }));
          combinedModels = [...combinedModels, ...parsedModels];
          connectionStatusUpdates.ollamaConnected = true;
        } else {
          connectionStatusUpdates.ollamaConnected = false;
          // Optionally clear the URL if connection fails persistently
          // updateConfig({ ollamaConnected: false, ollamaUrl: '' });
        }
      }

      // LM Studio
      if (config?.lmStudioUrl) {
        const lmStudioModels = await fetchDataSilently(`${config.lmStudioUrl}/v1/models`);
        if (lmStudioModels?.data) {
          const parsedModels = lmStudioModels.data.map((m: any) => ({ ...m, host: 'lmStudio' }));
          combinedModels = [...combinedModels, ...parsedModels];
          connectionStatusUpdates.lmStudioConnected = true;
        } else {
          connectionStatusUpdates.lmStudioConnected = false;
          // updateConfig({ lmStudioConnected: false, lmStudioUrl: '' });
        }
      }

      // Groq
      if (config?.groqApiKey) {
        const groqModels = await fetchDataSilently(GROQ_URL, { headers: { Authorization: `Bearer ${config.groqApiKey}` } });
        if (groqModels?.data) {
          const parsedModels = groqModels.data.map((m: any) => ({ ...m, host: 'groq' }));
          combinedModels = [...combinedModels, ...parsedModels];
          connectionStatusUpdates.groqConnected = true;
        } else {
          connectionStatusUpdates.groqConnected = false;
        }
      }

      // OpenAI
      if (config?.openAiApiKey) {
        const openAiModels = await fetchDataSilently(OPENAI_URL, { headers: { Authorization: `Bearer ${config.openAiApiKey}` } });
        if (openAiModels?.data) {
          const parsedModels = openAiModels.data.filter((m: any) => m.id.startsWith('gpt-')).map((m: any) => ({ ...m, host: 'openai' }));
          combinedModels = [...combinedModels, ...parsedModels];
          connectionStatusUpdates.openAiConnected = true;
        } else {
          connectionStatusUpdates.openAiConnected = false;
        }
      }

      // Gemini
      if (config?.geminiApiKey) {
        const geminiModels = await fetchDataSilently(`${GEMINI_URL}?key=${config.geminiApiKey}`);
        if (geminiModels?.models) {
          const parsedModels = geminiModels.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => ({ id: m.name, name: m.displayName, host: 'gemini' }));
          combinedModels = [...combinedModels, ...parsedModels];
          connectionStatusUpdates.geminiConnected = true;
        } else {
          connectionStatusUpdates.geminiConnected = false;
        }
      }

      // Deduplicate models based on id, prioritizing non-ollama if duplicates exist
      const uniqueModels = Array.from(new Map(combinedModels.map(m => [m.id, m])).values());

      const currentModelIds = config?.models?.map((m: { id: string }) => m.id).sort().join(',') || '';
      const fetchedModelIds = uniqueModels.map((m: { id: string }) => m.id).sort().join(',') || '';
      const idChange = currentModelIds !== fetchedModelIds;

      const configChanges: any = { ...connectionStatusUpdates };

      if (uniqueModels.length > 0 && idChange) {
        configChanges.models = uniqueModels;
        const isSelectedAvailable = config?.selectedModel && uniqueModels.some(m => m.id === config.selectedModel);
        // Only update selectedModel if the current one is no longer available or if none was selected
        if (!isSelectedAvailable || !config?.selectedModel) {
           configChanges.selectedModel = uniqueModels[0]?.id;
        }
      } else if (uniqueModels.length === 0 && config?.models?.length > 0) {
        // Clear models if fetch returns none but config had some
        configChanges.models = [];
        configChanges.selectedModel = undefined;
      }

      // Only call updateConfig if there are actual changes
      if (Object.keys(configChanges).length > 0) {
         // Check if connection status actually changed before including
         const finalChanges: any = {};
         for (const key in configChanges) {
            if (key === 'models' || key === 'selectedModel' || config[key] !== configChanges[key]) {
                finalChanges[key] = configChanges[key];
            }
         }
         if (Object.keys(finalChanges).length > 0) {
            updateConfig(finalChanges);
         }
      }
    };

    fetchModels();
  }, 5000); // Keep interval at 5 seconds

  // This hook doesn't need to return chatTitle
  // return { chatTitle, setChatTitle };
  return {}; // Return empty object or null if nothing needs to be returned
};
