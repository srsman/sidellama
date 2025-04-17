import React from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Link,
  Text,
  // Add imports for the Gemini section
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Select, // Import Select for the provider dropdown
} from '@chakra-ui/react';
import { ConnectGroq } from './ConnectGroq';
import { ConnectOllama } from './ConnectOllama';
import { SettingTitle } from './SettingsTitle';
import { ConnectGemini } from './ConnectGemini';
// import { ConnectClaude } from './ConnectClaude'; // Keep commented if not used
import { ConnectLmStudio } from './ConnectLmStudio';
import { ConnectOpenAI } from './ConnectOpenAI';
// Add imports for Redux state access
// import { useDispatch, useSelector } from 'react-redux'; // Remove Redux imports
// import { setProvider, setGeminiApiKey } from 'src/state/slices/sidePanel'; // Remove Redux imports
// import { State } from 'src/state/State'; // Remove Redux imports
import { useConfig } from './ConfigContext'; // Import useConfig

type ConnectionProps = {
  title: string;
  Component: React.FC<any>;
  link?: string;
};

const borderStyle: string = '2px solid var(--text)';
const textStyle = {
  fontWeight: 800,
  paddingTop: 2,
  paddingBottom: 2,
  paddingLeft: 4,
  fontSize: 'lg',
  color: 'var(--text)'
};

const ConnectionSection: React.FC<ConnectionProps> = ({ title, Component, link }) => (
  <>
    <Text textAlign="left" {...textStyle}>
      {title}
      {' '}
      {link && (
      <Link isExternal fontSize="sm" color="var(--text)" ml="0.5rem" href={link}>
        api keys
        {' '}
        <ExternalLinkIcon mx="2px" />
      </Link>
      )}
    </Text>
    <Component />
  </>
);

// Keep only one export for the Connect component
export const Connect: React.FC = () => {
  // Use useConfig instead of Redux hooks
  const { config, updateConfig } = useConfig();
  // const dispatch = useDispatch(); // Remove
  // const { provider, geminiApiKey } = useSelector((state: State) => state.sidePanel.config); // Remove

  return (
    <AccordionItem border={borderStyle} borderRadius={16} mb={4} mt={2}>
      <AccordionButton _hover={{ backgroundColor: 'transparent' }} paddingBottom={1} paddingRight={2}>
        <SettingTitle icon="🔗" padding={0} text="connections" />
      </AccordionButton>
      <AccordionPanel p={4}> {/* Add padding to the panel */}
        {/* Provider Selection Dropdown */}
        <FormControl mb={4}> {/* Add margin bottom */}
          <FormLabel>AI Provider</FormLabel>
          <Select
            value={config.provider} // Use config.provider from useConfig
            onChange={(e) => updateConfig({ provider: e.target.value })} // Use updateConfig
            borderColor="var(--text)" // Style consistency
            _focus={{ borderColor: 'var(--text)', boxShadow: 'none !important' }}
            _hover={{ borderColor: 'var(--text)', boxShadow: 'none !important' }}
            borderRadius={16} // Style consistency
          >
            {/* Add options for each provider */}
            <option value="lmstudio">LM Studio</option>
            <option value="ollama">Ollama</option>
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            {/* Add other providers if needed */}
            {/* <option value="claude">Claude</option> */}
          </Select>
        </FormControl>

        {/* Use config.provider for conditional rendering */}
        {config.provider === 'ollama' && <ConnectionSection Component={ConnectOllama} title="ollama" />}
        {config.provider === 'lmstudio' && <ConnectionSection Component={ConnectLmStudio} title="lm studio" />}
        {config.provider === 'groq' && <ConnectionSection Component={ConnectGroq} title="groq" link="https://console.groq.com/keys" />}
        {/* {config.provider === 'claude' && <ConnectionSection Component={ConnectClaude} title="claude" link="https://console.anthropic.com/settings/keys" />} */}
        {config.provider === 'openai' && <ConnectionSection Component={ConnectOpenAI} title="openai" link="https://platform.openai.com/api-keys" />}

        {config.provider === 'gemini' && <ConnectionSection Component={ConnectGemini} title="gemini" link="https://aistudio.google.com/app/apikey" />}
        {/* Remove individual ConnectionSection calls if they are now conditional */}
      </AccordionPanel>
    </AccordionItem>
  );
};

// Remove the duplicate export const Connect = () => { ... }; definition entirely
