import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BloomLogoProps {
  size?: number;
  color?: string;
}

interface RingProgressProps {
  size?: number;
  progress?: number;
  color?: string;
}

export const BloomLogo: React.FC<BloomLogoProps> = ({ size = 80, color = '#FF2D55' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 10C50 10 35 25 35 45C35 60 42 70 50 75C58 70 65 60 65 45C65 25 50 10 50 10Z"
        fill={color}
      />
      <Path
        d="M50 75V95"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Path
        d="M50 55C50 55 30 50 20 35"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M50 45C50 45 70 40 80 25"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M50 50C50 50 60 60 75 65"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M50 50C50 50 40 60 25 65"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const RingProgress: React.FC<RingProgressProps> = ({ size = 200, progress = 0.75, color = '#FF2D55' }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={`M ${size / 2} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${size / 2} ${size - strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${size / 2} ${strokeWidth / 2}`}
        fill="none"
        stroke="#2C2C2E"
        strokeWidth={strokeWidth}
      />
      <Path
        d={`M ${size / 2} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${size / 2} ${size - strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${size / 2} ${strokeWidth / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
};
