import React from 'react';
import { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. ULTRA-PREMIUM 3D PROFILE VIEWS (Luminescent Holographic Radar Eye)
export function ProfileViewsStatIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="eyeLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="50%" stopColor="#0284C7" />
          <Stop offset="100%" stopColor="#0369A1" />
        </LinearGradient>
        <LinearGradient id="eyeIrisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#67E8F9" />
          <Stop offset="100%" stopColor="#0EA5E9" />
        </LinearGradient>
        <LinearGradient id="glowRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
        </LinearGradient>
      </Defs>

      {/* Outer Ethereal Glow Ring */}
      <Path
        d="M2 18C5.5 9.5 11.2 5 18 5s12.5 4.5 16 13c-3.5 8.5-9.2 13-16 13S5.5 26.5 2 18z"
        fill="url(#glowRing)"
      />

      {/* Main Eye Sclera Glass */}
      <Path
        d="M3.5 18C6.8 10.5 12 6.5 18 6.5s11.2 4 14.5 11.5c-3.3 7.5-8.5 11.5-14.5 11.5S6.8 25.5 3.5 18z"
        fill="#FFFFFF"
      />

      {/* Outer Iris Circle with Gradient */}
      <Circle cx="18" cy="18" r="8.5" fill="url(#eyeLensGrad)" />
      
      {/* Inner Vibrant Glowing Iris */}
      <Circle cx="18" cy="18" r="6" fill="url(#eyeIrisGrad)" />

      {/* Deep Center Pupil */}
      <Circle cx="18" cy="18" r="3.2" fill="#0C4A6E" />

      {/* Specular 3D Light Glints */}
      <Circle cx="15.8" cy="15.8" r="2" fill="#FFFFFF" />
      <Circle cx="20.2" cy="20.2" r="1" fill="#FFFFFF" opacity="0.85" />
    </IconBase>
  );
}

// 2. ULTRA-PREMIUM 3D APPLICATIONS SENT (Neon Violet Casting Dossier & Fast Dispatch)
export function ApplicationsStatIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="dossierBack" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C4B5FD" />
          <Stop offset="100%" stopColor="#7C3AED" />
        </LinearGradient>
        <LinearGradient id="dossierMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#6D28D9" />
        </LinearGradient>
        <LinearGradient id="checkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>

      {/* Back Layer Sheet */}
      <Rect x="8" y="3" width="20" height="26" rx="4" fill="url(#dossierBack)" opacity="0.6" />

      {/* Front Main Folder / Resume */}
      <Rect x="5" y="6" width="22" height="26" rx="4.5" fill="url(#dossierMain)" />

      {/* Folded Corner Accent */}
      <Path d="M20 6l7 7h-4a3 3 0 0 1-3-3V6z" fill="#DDD6FE" />

      {/* Crisp White Resume Details */}
      <Rect x="9" y="13" width="10" height="2.5" rx="1.2" fill="#FFFFFF" />
      <Rect x="9" y="17.5" width="14" height="2" rx="1" fill="#DDD6FE" />
      <Rect x="9" y="21.5" width="11" height="2" rx="1" fill="#DDD6FE" />

      {/* Fast Dispatch Arrow / Checkmark Badge */}
      <Circle cx="25" cy="25" r="7" fill="url(#checkGlow)" />
      <Circle cx="25" cy="25" r="5.8" fill="#10B981" />
      <Path
        d="M22 25l2.2 2.2 4-4"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// 3. ULTRA-PREMIUM 3D SHORTLISTED (24K Gold Star Talent Trophy Shield)
export function ShortlistedStatIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="goldShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="50%" stopColor="#059669" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
        <LinearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="50%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
        <LinearGradient id="wreathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6EE7B7" />
          <Stop offset="100%" stopColor="#10B981" />
        </LinearGradient>
      </Defs>

      {/* Outer Emerald Shield */}
      <Path
        d="M18 2.5L31 7.5v11c0 9.5-6.5 14.5-13 16C11.5 33 5 28 5 18.5V7.5l13-5z"
        fill="url(#goldShieldGrad)"
      />

      {/* Inner Inset Shield Rim */}
      <Path
        d="M18 4.8L28.5 9v9.5c0 7.8-5.2 12-10.5 13.5C12.7 30.5 7.5 26.3 7.5 18.5V9l10.5-4.2z"
        fill="#065F46"
        opacity="0.35"
      />

      {/* Sparkling 3D Star Badge */}
      <Path
        d="M18 9l2.5 5.2 5.7.8-4.2 4 1 5.7L18 22l-5 2.7 1-5.7-4.2-4 5.7-.8L18 9z"
        fill="url(#starGold)"
      />

      {/* Star Center Facet Highlight */}
      <Path
        d="M18 9l2.5 5.2 5.7.8-4.2 4L18 16.5V9z"
        fill="#FEF08A"
        opacity="0.7"
      />

      {/* Victory Gem Spark */}
      <Circle cx="18" cy="16.5" r="2.2" fill="#FFFFFF" />
      <Circle cx="17.4" cy="15.8" r="0.9" fill="#F59E0B" />
    </IconBase>
  );
}

// 4. ULTRA-PREMIUM 3D ROCKET BOOSTER (High-Thrust Profile Rocket)
export function ProfileRocketIcon({ size = 36, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 40 40" {...props}>
      <Defs>
        <LinearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="40%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="rocketNoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F87171" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
        <LinearGradient id="fireOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="50%" stopColor="#F97316" />
          <Stop offset="100%" stopColor="#EF4444" />
        </LinearGradient>
        <LinearGradient id="fireInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#FBBF24" />
        </LinearGradient>
      </Defs>

      {/* Outer Blast Flare */}
      <Path
        d="M8 32c-2 4 1 7 4 6 1-3 3-5 5-7-3-1-6-1-9 1z"
        fill="url(#fireOuter)"
      />
      {/* Core Intense Plasma Flame */}
      <Path
        d="M10 30c-1 2.5.5 4.5 2.5 4 .8-2 2-3 3.5-4.5-2-.5-4-.5-6 .5z"
        fill="url(#fireInner)"
      />

      {/* Rocket Left Fin */}
      <Path d="M7 20l6 2-1 8-6-4 1-6z" fill="#1E40AF" />
      {/* Rocket Right Fin */}
      <Path d="M28 23l4-2 1 6-4 4-1-8z" fill="#1E3A8A" />

      {/* Main Streamlined Rocket Fuselage */}
      <Path
        d="M34 5c-5.5 0-14 3-19 8.5l-2.5 4c-1 2-1 5 .5 6.5l4 4c1.5 1.5 4.5 1.5 6.5.5l4-2.5c5.5-5 8.5-13.5 8.5-19 0-1.2-.8-2-2-2z"
        fill="url(#rocketBodyGrad)"
      />

      {/* Aerodynamic Red Nose Cone */}
      <Path
        d="M34 5c-3 0-7 1-10 3.5l6.5 6.5c2.5-3 3.5-7 3.5-10z"
        fill="url(#rocketNoseGrad)"
      />

      {/* Metallic Cockpit Glass Frame */}
      <Circle cx="24.5" cy="14.5" r="4.2" fill="#FFFFFF" />
      <Circle cx="24.5" cy="14.5" r="3" fill="#0284C7" />
      <Circle cx="23.5" cy="13.5" r="1.2" fill="#E0F2FE" />

      {/* Trailing Space Spark Particles */}
      <Circle cx="6" cy="38" r="1.5" fill="#FBBF24" />
      <Circle cx="16" cy="36" r="1.2" fill="#F97316" />
      <Circle cx="4" cy="27" r="1.2" fill="#60A5FA" />
    </IconBase>
  );
}
