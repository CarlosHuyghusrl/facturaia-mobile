/**
 * Logo FacturaIA - PNG Component
 */

import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  showBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 100, showBackground = true }) => {
  return (
    <View style={[
      styles.container,
      { width: size, height: size, borderRadius: size * 0.15 },
      showBackground && { overflow: 'hidden' },
    ]}>
      <Image
        source={require('../../assets/logo-facturaia-fixed.png')}
        style={{ width: size, height: size, borderRadius: size * 0.15 }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo;
