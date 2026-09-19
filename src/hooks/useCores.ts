import { useColorScheme } from 'react-native';
import { cores } from '../constants/cores';

export function useCores() {
  const esquema = useColorScheme();
  return cores[esquema === 'dark' ? 'dark' : 'light'];
}