import React from 'react';
import { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. HOME TAB ICON
export function HomeTabIcon({ size = 26, focused = false, activeColor = '#0284C7', inactiveColor = '#94A3B8', ...props }) {
  if (focused) {
    return (
      <IconBase size={size} viewBox="0 0 32 32" {...props}>
        <Defs>
          <LinearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0284C7" />
          </LinearGradient>
        </Defs>
        {/* Solid House Body */}
        <Path
          d="M16 2.5l13.5 11.2a1.5 1.5 0 0 1-1 2.6H26v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 6 27.3V16.3H3.5a1.5 1.5 0 0 1-1-2.6L16 2.5z"
          fill="url(#homeGrad)"
        />
        {/* Solid Contrasting Door / Light */}
        <Path
          d="M13 29.8v-9a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v9"
          fill="#FFFFFF"
        />
      </IconBase>
    );
  }

  // Inactive Outline
  return (
    <IconBase size={size} color={inactiveColor} viewBox="0 0 32 32" {...props}>
      <Path
        d="M16 4.5l11.5 9.5v12a2 2 0 0 1-2 2h-4v-8a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v8H6.5a2 2 0 0 1-2-2v-12L16 4.5z"
        stroke={inactiveColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </IconBase>
  );
}

// 2. PROFILE TAB ICON
export function ProfileTabIcon({ size = 26, focused = false, activeColor = '#0284C7', inactiveColor = '#94A3B8', ...props }) {
  if (focused) {
    return (
      <IconBase size={size} viewBox="0 0 32 32" {...props}>
        <Defs>
          <LinearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#60A5FA" />
            <Stop offset="100%" stopColor="#2563EB" />
          </LinearGradient>
        </Defs>
        {/* Solid Head */}
        <Circle cx="16" cy="9.5" r="5.5" fill="url(#profGrad)" />
        {/* Solid Torso / Shoulders */}
        <Path
          d="M6.5 26.5c0-5 4.2-8 9.5-8s9.5 3 9.5 8a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2z"
          fill="url(#profGrad)"
        />
        {/* Inner Highlight on Chest */}
        <Circle cx="16" cy="22" r="1.5" fill="#BFDBFE" />
      </IconBase>
    );
  }

  return (
    <IconBase size={size} color={inactiveColor} viewBox="0 0 32 32" {...props}>
      <Circle cx="16" cy="10" r="5" stroke={inactiveColor} strokeWidth="2.2" fill="none" />
      <Path
        d="M7 26.5c0-4.5 4-7.5 9-7.5s9 3 9 7.5"
        stroke={inactiveColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </IconBase>
  );
}

// 3. AUDITIONS TAB ICON (Spotlight / Search)
export function AuditionsTabIcon({ size = 26, focused = false, activeColor = '#0284C7', inactiveColor = '#94A3B8', ...props }) {
  if (focused) {
    return (
      <IconBase size={size} viewBox="0 0 32 32" {...props}>
        <Defs>
          <LinearGradient id="audGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>
        </Defs>
        {/* Solid Magnifying Glass Lens */}
        <Circle cx="14" cy="14" r="9.5" fill="url(#audGrad)" />
        <Circle cx="14" cy="14" r="6.5" fill="#FEF3C7" />
        {/* Star in Center */}
        <Path
          d="M14 10l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L14 10z"
          fill="#D97706"
        />
        {/* Handle */}
        <Path
          d="M21 21l7 7"
          stroke="#B45309"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </IconBase>
    );
  }

  return (
    <IconBase size={size} color={inactiveColor} viewBox="0 0 32 32" {...props}>
      <Circle cx="14" cy="14" r="8.5" stroke={inactiveColor} strokeWidth="2.2" fill="none" />
      <Path d="M20.5 20.5l6.5 6.5" stroke={inactiveColor} strokeWidth="2.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 4. APPLICATIONS TAB ICON (Dossier / Document)
export function ApplicationsTabIcon({ size = 26, focused = false, activeColor = '#0284C7', inactiveColor = '#94A3B8', ...props }) {
  if (focused) {
    return (
      <IconBase size={size} viewBox="0 0 32 32" {...props}>
        <Defs>
          <LinearGradient id="appGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
        </Defs>
        {/* Solid Document Sheet */}
        <Path
          d="M7 4a3 3 0 0 1 3-3h10l6 6v21a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V4z"
          fill="url(#appGrad)"
        />
        {/* Folded Corner */}
        <Path d="M20 1v6h6" fill="#A7F3D0" />
        {/* Checkmark in Center */}
        <Path
          d="M11 16l3.5 3.5 7-7"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </IconBase>
    );
  }

  return (
    <IconBase size={size} color={inactiveColor} viewBox="0 0 32 32" {...props}>
      <Path
        d="M8 4a2 2 0 0 1 2-2h9l6 6v19a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V4z"
        stroke={inactiveColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M19 2v6h6M12 14h8M12 19h5" stroke={inactiveColor} strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// 5. MESSAGES TAB ICON (Chat Bubbles)
export function MessagesTabIcon({ size = 26, focused = false, activeColor = '#0284C7', inactiveColor = '#94A3B8', ...props }) {
  if (focused) {
    return (
      <IconBase size={size} viewBox="0 0 32 32" {...props}>
        <Defs>
          <LinearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EC4899" />
            <Stop offset="100%" stopColor="#8B5CF6" />
          </LinearGradient>
        </Defs>
        {/* Back Bubble */}
        <Path
          d="M18 6h5a6 6 0 0 1 6 6c0 3.3-2.7 6-6 6h-1l-3 2.5V18a6 6 0 0 1-1-12z"
          fill="#F472B6"
          opacity="0.6"
        />
        {/* Main Solid Bubble */}
        <Path
          d="M4 14a8 8 0 0 1 8-8h5a8 8 0 0 1 8 8c0 4.4-3.6 8-8 8h-2.5l-4.5 4v-4.2A7.8 7.8 0 0 1 4 14z"
          fill="url(#chatGrad)"
        />
        {/* White Dots */}
        <Circle cx="10" cy="14" r="1.5" fill="#FFFFFF" />
        <Circle cx="14.5" cy="14" r="1.5" fill="#FFFFFF" />
        <Circle cx="19" cy="14" r="1.5" fill="#FFFFFF" />
      </IconBase>
    );
  }

  return (
    <IconBase size={size} color={inactiveColor} viewBox="0 0 32 32" {...props}>
      <Path
        d="M5 15a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7c0 3.8-3.1 7-7 7h-2.5l-4 3.5v-3.7A6.8 6.8 0 0 1 5 15z"
        stroke={inactiveColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </IconBase>
  );
}
