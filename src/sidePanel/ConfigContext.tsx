import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadConfig } from '../state/slices/sidePanel';

export const ConfigContext = createContext({});

export const personas = { sidellama: 'you are sidellama, a friendly web assistant' };

const defaultConfig = { personas, generateTitle: true, backgroundImage: true, persona: 'sidellama', webMode: 'brave', webLimit: 10, contextLimit: 10 };

export const ConfigProvider = ({ children }: any) => {
  const dispatch = useDispatch();
  const initialConfig = JSON.parse(localStorage.getItem('config') || JSON.stringify(defaultConfig));

  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (config?.fontSize) {
      document.documentElement.style.setProperty('font-size', `${config?.fontSize}px`);
    }
  }, [config?.fontSize]);

  const updateConfig = (newConfig: any) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    dispatch(loadConfig(updatedConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext) as { config: any, updateConfig: (v: any) => void };
