/**
 * Logo FacturaIA - SVG Component
 * Diseño: Cyan neón sobre fondo oscuro
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Circle } from 'react-native-svg';

interface LogoProps {
  size?: number;
  showBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 100, showBackground = true }) => {
  const scale = size / 100;

  return (
    <View style={[
      styles.container,
      showBackground && styles.background,
      { width: size, height: size, borderRadius: size * 0.2237 }
    ]}>
      <Svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 100 100"
      >
        <Defs>
          <LinearGradient id="mainGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#22D3EE" />
            <Stop offset="1" stopColor="#3B82F6" />
          </LinearGradient>
        </Defs>

        {/* Marco documento - L invertida */}
        <Path
          d="M20 20 H70 C75.5228 20 80 24.4772 80 30 V80"
          stroke="url(#mainGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Línea de escaneo */}
        <Rect x="20" y="55" width="40" height="12" rx="6" fill="#22D3EE" />

        {/* Punto IA */}
        <Circle cx="70" cy="70" r="10" fill="#3B82F6" />

        {/* Destello IA */}
        <Path
          d="M70 65 L72 60 L74 65 L79 67 L74 69 L72 74 L70 69 L65 67 L70 65 Z"
          fill="white"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    backgroundColor: '#0f172a', // slate-900
  },
});

export default Logo;
