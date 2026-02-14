import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, SymbolViewProps, SFSymbol } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle, TextStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'ellipsis': 'more-horiz',
  'clock': 'access-time',
  'plus.circle.fill': 'add-circle',
} as Partial<
  Record<
    SFSymbol,
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;


export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: any; 
  weight?: SymbolViewProps['weight'];
}) {
  const isIos = process.env.EXPO_OS === 'ios';

  if (isIos) {
    return (
      <SymbolView
        weight="medium"
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={name}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
      />
    );
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}