import { Platform } from 'react-native';

export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return Platform.OS === 'web' ? server : client;
}
