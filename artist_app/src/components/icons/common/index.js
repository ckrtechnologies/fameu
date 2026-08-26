import React from 'react';
import { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

export function ArrowBackIcon({ size = 24, color = '#1E293B', strokeWidth = 2.5, ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function ShareIcon({ size = 24, color = '#3B82F6', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="shareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#60A5FA" />
        </LinearGradient>
      </Defs>
      {/* 3 Filled Nodes */}
      <Circle cx="24" cy="8" r="5" fill="url(#shareGrad)" />
      <Circle cx="8" cy="16" r="5" fill="url(#shareGrad)" />
      <Circle cx="24" cy="24" r="5" fill="url(#shareGrad)" />
      {/* Connecting thick rods */}
      <Path d="m12 14 8.5-4.5M12 18l8.5 4.5" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    </IconBase>
  );
}

export function CloseIcon({ size = 24, color = '#FFFFFF', strokeWidth = 2.5, ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <Path
        d="M18 6 6 18M6 6l12 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function ChevronBackIcon({ size = 24, color = '#FFFFFF', strokeWidth = 2.5, ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function ChevronForwardIcon({ size = 24, color = '#FFFFFF', strokeWidth = 2.5, ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function WarningIcon({ size = 24, color = '#EF4444', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#F87171" />
        </LinearGradient>
      </Defs>
      {/* Filled Shield / Triangle */}
      <Path
        d="M14.2 3.8a2.1 2.1 0 0 1 3.6 0l12.4 21.6A2.1 2.1 0 0 1 28.4 28H3.6a2.1 2.1 0 0 1-1.8-3.1L14.2 3.8z"
        fill="url(#warnGrad)"
      />
      <Path d="M16 11v7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="16" cy="22.5" r="1.5" fill="#FFFFFF" />
    </IconBase>
  );
}

export function TrashIcon({ size = 24, color = '#EF4444', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="trashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>
      {/* Lid */}
      <Path d="M6 9h20M12 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
      {/* Filled Can */}
      <Path d="M8 9l1.5 16a3 3 0 0 0 3 2.8h7a3 3 0 0 0 3-2.8L24 9H8z" fill="url(#trashGrad)" />
      {/* Interior slots */}
      <Path d="M13 14v8M16 14v8M19 14v8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function SendIcon({ size = 20, color = '#FFFFFF', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Path
        d="M29 3 14 18M29 3l-9 26-5-11-12-5 26-10z"
        fill={color}
      />
    </IconBase>
  );
}

export function CloseCircleIcon({ size = 20, color = '#94A3B8', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Circle cx="16" cy="16" r="14" fill="#E2E8F0" />
      <Path d="M11 11l10 10M21 11L11 21" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    </IconBase>
  );
}

// Solid Filled Person / Avatar Icon
export function PersonCircleIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="personGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#6366F1" />
        </LinearGradient>
      </Defs>
      {/* Outer Circle Base */}
      <Circle cx="16" cy="16" r="14" fill="#EFF6FF" />
      {/* Head */}
      <Circle cx="16" cy="11.5" r="5" fill="url(#personGrad)" />
      {/* Torso / Shoulders */}
      <Path
        d="M7.5 25.5c0-4.7 3.8-7.5 8.5-7.5s8.5 2.8 8.5 7.5a13.9 13.9 0 0 1-17 0z"
        fill="url(#personGrad)"
      />
    </IconBase>
  );
}
