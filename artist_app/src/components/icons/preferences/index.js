import React from 'react';
import { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

export function WorkBriefcaseIcon({ size = 22, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="workGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EA580C" />
          <Stop offset="100%" stopColor="#FB923C" />
        </LinearGradient>
      </Defs>
      {/* Briefcase base */}
      <Rect x="3" y="9" width="26" height="19" rx="5" fill="url(#workGrad)" />
      {/* Handle */}
      <Path
        d="M11 9V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3"
        stroke="#EA580C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Center Lock / Badge */}
      <Rect x="13.5" y="15" width="5" height="5" rx="1.5" fill="#FEF08A" />
      {/* Accent Stitching / Belt */}
      <Path d="M3 16h26" stroke="#C2410C" strokeWidth="1.5" strokeDasharray="3 2" />
    </IconBase>
  );
}

export function PreferredLocationIcon({ size = 22, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="prefLocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0D9488" />
          <Stop offset="100%" stopColor="#2DD4BF" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="27" r="5" fill="#CCFBF1" />
      <Path
        d="M26 13.5C26 21 16 28 16 28S6 21 6 13.5a10 10 0 1 1 20 0Z"
        fill="url(#prefLocGrad)"
      />
      <Circle cx="16" cy="13.5" r="4.5" fill="#FFFFFF" />
      <Circle cx="16" cy="13.5" r="2.5" fill="#0D9488" />
    </IconBase>
  );
}

export function LookAlikeIcon({ size = 22, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="lookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#9333EA" />
          <Stop offset="100%" stopColor="#C084FC" />
        </LinearGradient>
      </Defs>
      {/* Front Face */}
      <Circle cx="12" cy="11" r="5.5" fill="url(#lookGrad)" />
      <Path d="M4 27c0-4.5 3.5-7 8-7s8 2.5 8 7" fill="url(#lookGrad)" opacity="0.9" />
      {/* Back / Twin Face */}
      <Circle cx="21" cy="9" r="4.5" fill="#DDD6FE" stroke="#9333EA" strokeWidth="1.5" />
      <Path d="M21 17c3 0 6 2 6 6" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

export function HashtagIcon({ size = 22, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#DB2777" />
          <Stop offset="100%" stopColor="#F472B6" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="14" fill="#FCE7F3" />
      <Path
        d="M8 12h16M6 20h16M13 5l-3 22M21 5l-3 22"
        stroke="url(#tagGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function PreferencesGearIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#60A5FA" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13" fill="#EFF6FF" stroke="url(#gearGrad)" strokeWidth="2.5" />
      {/* Sliders / Switches */}
      <Path d="M8 10h16M8 16h16M8 22h16" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="12" cy="10" r="2.5" fill="#2563EB" />
      <Circle cx="20" cy="16" r="2.5" fill="#2563EB" />
      <Circle cx="14" cy="22" r="2.5" fill="#2563EB" />
    </IconBase>
  );
}
