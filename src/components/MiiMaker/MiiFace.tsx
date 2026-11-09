import React from 'react';
import { MiiAvatar } from '../../types';

interface MiiFaceProps {
  avatar: Partial<MiiAvatar>;
  size?: number; // width & height in px, default 80
  showBorder?: boolean;
  className?: string;
}

export const MiiFace: React.FC<MiiFaceProps> = ({
  avatar,
  size = 80,
  showBorder = true,
  className = '',
}) => {
  const {
    skinColor = '#fed7aa',
    headShape = 'oval',
    headScaleX = 1,
    headScaleY = 1,
    hairStyle = 'short',
    hairColor = '#78350f',
    hairScale = 1,
    hairScaleX = 1,
    hairScaleY = 1,
    hairOffsetX = 0,
    hairOffsetY = 0,
    eyeStyle = 'normal',
    eyeColor = '#1e293b',
    eyeScale = 1,
    eyeScaleX = 1,
    eyeScaleY = 1,
    eyeOffsetX = 0,
    eyeOffsetY = 0,
    eyebrowStyle = 'normal',
    mouthStyle = 'smile',
    mouthScale = 1,
    mouthScaleX = 1,
    mouthScaleY = 1,
    mouthOffsetX = 0,
    mouthOffsetY = 0,
    noseStyle = 'classic',
    noseScale = 1,
    noseScaleX = 1,
    noseScaleY = 1,
    noseOffsetX = 0,
    noseOffsetY = 0,
    earStyle = 'normal',
    earScale = 1,
    earScaleX = 1,
    earScaleY = 1,
    facialHair = 'none',
    facialHairColor,
    facialHairScaleX = 1,
    facialHairScaleY = 1,
    facialHairOffsetX = 0,
    facialHairOffsetY = 0,
    glasses = 'none',
    headwear = 'none',
    headwearColor,
    headwearScaleX = 1,
    headwearScaleY = 1,
    headwearOffsetX = 0,
    headwearOffsetY = 0,
    moleStyle = 'none',
    moleScale = 1,
    moleOffsetX = 0,
    moleOffsetY = 0,
    blush = false,
    favoriteColor = '#3b82f6',
  } = avatar;

  const actualFacialHairColor = facialHairColor || hairColor;
  const actualHeadwearColor = headwearColor || favoriteColor;

  // Composite scales for full deformation support (< > width, v ^ height)
  const effHairScaleX = (hairScaleX ?? 1) * (hairScale ?? 1);
  const effHairScaleY = (hairScaleY ?? 1) * (hairScale ?? 1);

  const effEyeScaleX = (eyeScaleX ?? 1) * (eyeScale ?? 1);
  const effEyeScaleY = (eyeScaleY ?? 1) * (eyeScale ?? 1);

  const effNoseScaleX = (noseScaleX ?? 1) * (noseScale ?? 1);
  const effNoseScaleY = (noseScaleY ?? 1) * (noseScale ?? 1);

  const effMouthScaleX = (mouthScaleX ?? 1) * (mouthScale ?? 1);
  const effMouthScaleY = (mouthScaleY ?? 1) * (mouthScale ?? 1);

  const effEarScaleX = (earScaleX ?? 1) * (earScale ?? 1);
  const effEarScaleY = (earScaleY ?? 1) * (earScale ?? 1);

  const effHeadScaleX = headScaleX ?? 1;
  const effHeadScaleY = headScaleY ?? 1;

  const effFacialHairScaleX = facialHairScaleX ?? 1;
  const effFacialHairScaleY = facialHairScaleY ?? 1;

  const effHeadwearScaleX = headwearScaleX ?? 1;
  const effHeadwearScaleY = headwearScaleY ?? 1;

  const effMoleScale = moleScale ?? 1;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
        showBorder ? 'border-2 border-white shadow-md' : ''
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: `${favoriteColor}20`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Soft Background Radial Glow based on favorite color */}
        <circle cx="50" cy="50" r="48" fill={favoriteColor} opacity="0.15" />

        {/* ===================================================================
            LAYER 1: BACKGROUND HAIR (Hair that sits behind head/neck)
           =================================================================== */}
        <g
          transform={`translate(${hairOffsetX}, ${hairOffsetY}) translate(50, 30) scale(${effHairScaleX}, ${effHairScaleY}) translate(-50, -30)`}
        >
          {hairStyle === 'afro' && (
            <circle cx="50" cy="46" r="38" fill={hairColor} />
          )}

          {hairStyle === 'long' && (
            <path
              d="M 18 48 C 16 70, 20 86, 28 88 C 32 88, 32 76, 26 58 C 24 45, 26 32, 50 30 C 74 32, 76 45, 74 58 C 68 76, 68 88, 72 88 C 80 86, 84 70, 82 48 C 80 22, 66 16, 50 16 C 34 16, 20 22, 18 48 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'ponytail' && (
            <g fill={hairColor}>
              <ellipse cx="50" cy="11" rx="10" ry="8" />
              <ellipse cx="50" cy="7" rx="6" ry="6" />
            </g>
          )}

          {hairStyle === 'curly' && (
            <g fill={hairColor}>
              <circle cx="20" cy="40" r="10" />
              <circle cx="80" cy="40" r="10" />
              <circle cx="18" cy="52" r="9" />
              <circle cx="82" cy="52" r="9" />
            </g>
          )}

          {hairStyle === 'dreadlocks' && (
            <g fill={hairColor}>
              <rect x="16" y="32" width="7" height="42" rx="3.5" />
              <rect x="23" y="30" width="7" height="46" rx="3.5" />
              <rect x="70" y="30" width="7" height="46" rx="3.5" />
              <rect x="77" y="32" width="7" height="42" rx="3.5" />
              <circle cx="50" cy="30" r="32" />
            </g>
          )}

          {hairStyle === 'braids' && (
            <g fill={hairColor}>
              <path d="M 20 40 C 18 60, 22 76, 26 86 C 29 86, 29 80, 26 62 Z" />
              <path d="M 80 40 C 82 60, 78 76, 74 86 C 71 86, 71 80, 74 62 Z" />
              <circle cx="26" cy="88" r="3" fill={favoriteColor} />
              <circle cx="74" cy="88" r="3" fill={favoriteColor} />
            </g>
          )}

          {hairStyle === 'bun' && (
            <g fill={hairColor}>
              <circle cx="50" cy="13" r="12" />
              <ellipse cx="50" cy="18" rx="8" ry="4" opacity="0.3" fill="#000000" />
            </g>
          )}

          {hairStyle === 'wavy' && (
            <path
              d="M 18 45 Q 12 60 22 72 Q 14 82 25 88 Q 30 75 24 60 C 22 45, 26 32, 50 30 C 74 32, 78 45, 76 60 Q 70 75 75 88 Q 86 82 78 72 Q 88 60 82 45 Z"
              fill={hairColor}
            />
          )}
        </g>

        {/* ===================================================================
            LAYER 2: BODY, NECK, EARS & HEAD BASE
           =================================================================== */}
        {/* Shirt Collar / Neck in favorite color */}
        <path
          d="M 32 94 Q 50 82 68 94 L 74 100 L 26 100 Z"
          fill={favoriteColor}
          stroke="#ffffff"
          strokeWidth="1.5"
        />

        {/* Neck */}
        <rect x="44" y="74" width="12" height="12" fill={skinColor} />

        {/* Ears with deform scaleX, scaleY */}
        {earStyle !== 'none' && (
          <g transform={`translate(50, 52) scale(${effEarScaleX}, ${effEarScaleY}) translate(-50, -52)`}>
            {earStyle === 'normal' && (
              <>
                <circle cx="21" cy="52" r="7" fill={skinColor} />
                <circle cx="79" cy="52" r="7" fill={skinColor} />
                <circle cx="21" cy="52" r="3.5" fill="#000000" opacity="0.08" />
                <circle cx="79" cy="52" r="3.5" fill="#000000" opacity="0.08" />
              </>
            )}
            {earStyle === 'small' && (
              <>
                <circle cx="22" cy="52" r="5" fill={skinColor} />
                <circle cx="78" cy="52" r="5" fill={skinColor} />
                <circle cx="22" cy="52" r="2.5" fill="#000000" opacity="0.08" />
                <circle cx="78" cy="52" r="2.5" fill="#000000" opacity="0.08" />
              </>
            )}
            {earStyle === 'large' && (
              <>
                <ellipse cx="20" cy="52" rx="9" ry="11" fill={skinColor} />
                <ellipse cx="80" cy="52" rx="9" ry="11" fill={skinColor} />
                <ellipse cx="20" cy="52" rx="4.5" ry="5.5" fill="#000000" opacity="0.08" />
                <ellipse cx="80" cy="52" rx="4.5" ry="5.5" fill="#000000" opacity="0.08" />
              </>
            )}
            {earStyle === 'pointed' && (
              <>
                <path d="M 23 45 Q 12 40 14 52 Q 16 59 23 57 Z" fill={skinColor} />
                <path d="M 77 45 Q 88 40 86 52 Q 84 59 77 57 Z" fill={skinColor} />
                <path d="M 21 47 Q 15 44 17 52" stroke="#000000" strokeWidth="1" strokeLinecap="round" opacity="0.12" fill="none" />
                <path d="M 79 47 Q 85 44 83 52" stroke="#000000" strokeWidth="1" strokeLinecap="round" opacity="0.12" fill="none" />
              </>
            )}
            {earStyle === 'round' && (
              <>
                <ellipse cx="21" cy="52" rx="7.5" ry="8" fill={skinColor} />
                <ellipse cx="79" cy="52" rx="7.5" ry="8" fill={skinColor} />
                <circle cx="21" cy="52" r="3.5" fill="#000000" opacity="0.08" />
                <circle cx="79" cy="52" r="3.5" fill="#000000" opacity="0.08" />
              </>
            )}
          </g>
        )}

        {/* Head Shape with deform scaleX, scaleY */}
        <g transform={`translate(50, 52) scale(${effHeadScaleX}, ${effHeadScaleY}) translate(-50, -52)`}>
          {headShape === 'round' && (
            <circle
              cx="50"
              cy="52"
              r="29.5"
              fill={skinColor}
              stroke="#000000"
              strokeWidth="1.2"
              strokeOpacity="0.15"
            />
          )}
          {headShape === 'oval' && (
            <ellipse
              cx="50"
              cy="52"
              rx="29"
              ry="31"
              fill={skinColor}
              stroke="#000000"
              strokeWidth="1.2"
              strokeOpacity="0.15"
            />
          )}
          {headShape === 'square' && (
            <path
              d="M 23 34 C 23 23, 34 22, 50 22 C 66 22, 77 23, 77 34 L 77 64 C 77 78, 68 82, 50 82 C 32 82, 23 78, 23 64 Z"
              fill={skinColor}
              stroke="#000000"
              strokeWidth="1.2"
              strokeOpacity="0.15"
            />
          )}
          {headShape === 'triangle' && (
            <path
              d="M 22 36 C 22 22, 36 21, 50 21 C 64 21, 78 22, 78 36 C 78 52, 65 74, 50 84 C 35 74, 22 52, 22 36 Z"
              fill={skinColor}
              stroke="#000000"
              strokeWidth="1.2"
              strokeOpacity="0.15"
            />
          )}
          {headShape === 'wide' && (
            <ellipse
              cx="50"
              cy="53"
              rx="32"
              ry="29"
              fill={skinColor}
              stroke="#000000"
              strokeWidth="1.2"
              strokeOpacity="0.15"
            />
          )}
          {headShape === 'heart' && (
            <path
              d="M 21 37 C 21 23, 33 21, 50 22 C 67 21, 79 23, 79 37 C 78 56, 65 76, 50 83 C 35 76, 22 56, 21 37 Z"
              fill={skinColor}
              stroke="#000000"
              strokeWidth="1.2"
              strokeOpacity="0.15"
            />
          )}
        </g>

        {/* Blush Cheeks */}
        {blush && (
          <>
            <ellipse cx="32" cy="60" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.4" />
            <ellipse cx="68" cy="60" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.4" />
          </>
        )}

        {/* ===================================================================
            LAYER 3: FACIAL FEATURES (Moles, Eyebrows, Eyes, Nose, Mouth, Beard)
           =================================================================== */}
        {/* Moles & Marks (Moedervlekken, sproetjes, littekens) */}
        {moleStyle !== 'none' && (
          <g
            transform={`translate(${moleOffsetX}, ${moleOffsetY}) translate(50, 60) scale(${effMoleScale}) translate(-50, -60)`}
          >
            {moleStyle === 'mole_cheek' && (
              <circle cx="64" cy="62" r="1.5" fill="#451a03" />
            )}
            {moleStyle === 'mole_chin' && (
              <circle cx="46" cy="76" r="1.5" fill="#451a03" />
            )}
            {moleStyle === 'mole_lip' && (
              <circle cx="43" cy="64" r="1.4" fill="#451a03" />
            )}
            {moleStyle === 'freckles' && (
              <g fill="#92400e" opacity="0.7">
                {/* Left cheek freckles */}
                <circle cx="31" cy="58" r="0.9" />
                <circle cx="35" cy="56" r="1.1" />
                <circle cx="33" cy="60" r="0.8" />
                <circle cx="37" cy="59" r="1" />
                {/* Nose bridge */}
                <circle cx="48" cy="55" r="0.8" />
                <circle cx="52" cy="55" r="0.8" />
                {/* Right cheek freckles */}
                <circle cx="69" cy="58" r="0.9" />
                <circle cx="65" cy="56" r="1.1" />
                <circle cx="67" cy="60" r="0.8" />
                <circle cx="63" cy="59" r="1" />
              </g>
            )}
            {moleStyle === 'scar' && (
              <g stroke="#b91c1c" opacity="0.65" strokeLinecap="round">
                <line x1="33" y1="36" x2="38" y2="47" strokeWidth="1.5" />
                <line x1="33" y1="41" x2="37" y2="40" strokeWidth="1" />
                <line x1="34" y1="44" x2="38" y2="43" strokeWidth="1" />
              </g>
            )}
          </g>
        )}

        {/* Eyes & Eyebrows Group with fine-tune scale and offset */}
        <g
          transform={`translate(${eyeOffsetX}, ${eyeOffsetY}) translate(50, 48) scale(${effEyeScaleX}, ${effEyeScaleY}) translate(-50, -48)`}
        >
          {/* Eyebrows */}
          {eyebrowStyle === 'thick' && (
            <>
              <path d="M 32 38 Q 40 34 44 38" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 56 38 Q 60 34 68 38" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          )}
          {eyebrowStyle === 'arched' && (
            <>
              <path d="M 32 40 Q 38 33 44 39" stroke={hairColor} strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 56 39 Q 62 33 68 40" stroke={hairColor} strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}
          {eyebrowStyle === 'flat' && (
            <>
              <line x1="33" y1="38" x2="44" y2="38" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="38" x2="67" y2="38" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}
          {eyebrowStyle === 'normal' && (
            <>
              <path d="M 33 39 Q 39 36 44 39" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 56 39 Q 61 36 67 39" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Eyes */}
          {eyeStyle === 'happy' && (
            <>
              <path d="M 32 48 Q 38 42 44 48" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 56 48 Q 62 42 68 48" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}
          {eyeStyle === 'wink' && (
            <>
              <circle cx="38" cy="48" r="4.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
              <circle cx="38" cy="48" r="3" fill={eyeColor} />
              <circle cx="37" cy="47" r="1" fill="#ffffff" />
              <path d="M 56 49 Q 62 43 68 49" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}
          {eyeStyle === 'round' && (
            <>
              <circle cx="38" cy="48" r="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <circle cx="38" cy="48" r="3.2" fill={eyeColor} />
              <circle cx="37" cy="47" r="1.2" fill="#ffffff" />

              <circle cx="62" cy="48" r="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <circle cx="62" cy="48" r="3.2" fill={eyeColor} />
              <circle cx="61" cy="47" r="1.2" fill="#ffffff" />
            </>
          )}
          {eyeStyle === 'dots' && (
            <>
              <circle cx="38" cy="48" r="3" fill={eyeColor} />
              <circle cx="62" cy="48" r="3" fill={eyeColor} />
            </>
          )}
          {eyeStyle === 'cool' && (
            <>
              <path d="M 33 46 Q 38 52 43 46 Z" fill={eyeColor} />
              <circle cx="37" cy="48" r="1" fill="#ffffff" />
              <path d="M 57 46 Q 62 52 67 46 Z" fill={eyeColor} />
              <circle cx="61" cy="48" r="1" fill="#ffffff" />
            </>
          )}
          {eyeStyle === 'normal' && (
            <>
              <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
              <ellipse cx="38.5" cy="48" rx="2.8" ry="3.8" fill={eyeColor} />
              <circle cx="37.5" cy="46.5" r="1.2" fill="#ffffff" />

              <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
              <ellipse cx="61.5" cy="48" rx="2.8" ry="3.8" fill={eyeColor} />
              <circle cx="60.5" cy="46.5" r="1.2" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Nose Group with fine-tune scale and offset */}
        <g
          transform={`translate(${noseOffsetX}, ${noseOffsetY}) translate(50, 56) scale(${effNoseScaleX}, ${effNoseScaleY}) translate(-50, -56)`}
        >
          {noseStyle === 'classic' && (
            <path
              d="M 49 53 L 53 58 L 48 58"
              stroke="#000000"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.45"
            />
          )}
          {noseStyle === 'button' && (
            <circle
              cx="50"
              cy="56"
              r="3.2"
              fill="#000000"
              opacity="0.25"
            />
          )}
          {noseStyle === 'triangle' && (
            <polygon
              points="47,54 53,54 50,58.5"
              fill="#000000"
              opacity="0.35"
            />
          )}
          {noseStyle === 'pointed' && (
            <path
              d="M 50 51 L 53.5 57.5 L 48.5 58"
              stroke="#000000"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.45"
            />
          )}
          {noseStyle === 'round' && (
            <ellipse
              cx="50"
              cy="56"
              rx="4.2"
              ry="3.2"
              fill="#000000"
              opacity="0.25"
            />
          )}
          {noseStyle === 'dots' && (
            <>
              <circle cx="48" cy="57" r="1.3" fill="#000000" opacity="0.4" />
              <circle cx="52" cy="57" r="1.3" fill="#000000" opacity="0.4" />
            </>
          )}
        </g>

        {/* Mouth Group with fine-tune scale and offset */}
        <g
          transform={`translate(${mouthOffsetX}, ${mouthOffsetY}) translate(50, 67) scale(${effMouthScaleX}, ${effMouthScaleY}) translate(-50, -67)`}
        >
          {mouthStyle === 'big_smile' && (
            <path
              d="M 37 64 Q 50 78 63 64 Z"
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth="1.5"
            />
          )}
          {mouthStyle === 'teeth' && (
            <g>
              <path d="M 38 65 Q 50 76 62 65 Z" fill="#b91c1c" />
              <rect x="42" y="65" width="16" height="4" rx="1" fill="#ffffff" />
            </g>
          )}
          {mouthStyle === 'smirk' && (
            <path
              d="M 40 68 Q 48 68 62 63"
              stroke="#991b1b"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {mouthStyle === 'o' && (
            <circle cx="50" cy="67" r="4.5" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
          )}
          {mouthStyle === 'neutral' && (
            <line x1="42" y1="67" x2="58" y2="67" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
          )}
          {mouthStyle === 'smile' && (
            <path
              d="M 40 65 Q 50 73 60 65"
              stroke="#991b1b"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* Facial Hair (Snor & Baarden) with independent color, offset, and deformation */}
        {facialHair !== 'none' && (
          <g
            transform={`translate(${facialHairOffsetX}, ${facialHairOffsetY}) translate(50, 70) scale(${effFacialHairScaleX}, ${effFacialHairScaleY}) translate(-50, -70)`}
          >
            {facialHair === 'mustache' && (
              <path
                d="M 40 63 Q 45 60 50 63 Q 55 60 60 63 Q 50 67 40 63 Z"
                fill={actualFacialHairColor}
              />
            )}
            {facialHair === 'handlebar' && (
              <path
                d="M 37 62 Q 45 59 50 62 Q 55 59 63 62 Q 67 59 67 56 Q 64 64 56 65 Q 50 64 44 65 Q 36 64 33 56 Q 33 59 37 62 Z"
                fill={actualFacialHairColor}
              />
            )}
            {facialHair === 'walrus' && (
              <path
                d="M 38 62 C 42 61, 46 61, 50 63 C 54 61, 58 61, 62 62 C 64 67, 60 72, 50 72 C 40 72, 36 67, 38 62 Z"
                fill={actualFacialHairColor}
              />
            )}
            {facialHair === 'goatee' && (
              <ellipse cx="50" cy="78" rx="4.5" ry="4" fill={actualFacialHairColor} />
            )}
            {facialHair === 'soul_patch' && (
              <polygon points="48,72 52,72 50,76" fill={actualFacialHairColor} />
            )}
            {facialHair === 'stubble' && (
              <g fill={actualFacialHairColor} opacity="0.45">
                <circle cx="44" cy="74" r="0.8" />
                <circle cx="47" cy="75" r="0.8" />
                <circle cx="50" cy="75" r="0.8" />
                <circle cx="53" cy="75" r="0.8" />
                <circle cx="56" cy="74" r="0.8" />
                <circle cx="46" cy="78" r="0.8" />
                <circle cx="50" cy="79" r="0.8" />
                <circle cx="54" cy="78" r="0.8" />
                <circle cx="43" cy="63" r="0.7" />
                <circle cx="47" cy="62" r="0.7" />
                <circle cx="53" cy="62" r="0.7" />
                <circle cx="57" cy="63" r="0.7" />
              </g>
            )}
            {facialHair === 'chinstrap' && (
              <path
                d="M 23 54 C 22 72, 34 83, 50 83 C 66 83, 78 72, 77 54 C 76 66, 65 79, 50 79 C 35 79, 24 66, 23 54 Z"
                fill={actualFacialHairColor}
              />
            )}
            {facialHair === 'beard' && (
              <path
                d="M 23 54 C 21 72, 34 86, 50 86 C 66 86, 79 72, 77 54 C 75 68, 66 77, 50 77 C 34 77, 25 68, 23 54 Z"
                fill={actualFacialHairColor}
              />
            )}
          </g>
        )}

        {/* Glasses */}
        {glasses === 'round' && (
          <g stroke="#1e293b" strokeWidth="2" fill="none">
            <circle cx="38" cy="48" r="9" />
            <circle cx="62" cy="48" r="9" />
            <line x1="47" y1="48" x2="53" y2="48" />
            <line x1="21" y1="48" x2="29" y2="48" />
            <line x1="71" y1="48" x2="79" y2="48" />
          </g>
        )}
        {glasses === 'square' && (
          <g stroke="#1e293b" strokeWidth="2" fill="none">
            <rect x="29" y="40" width="18" height="15" rx="3" />
            <rect x="53" y="40" width="18" height="15" rx="3" />
            <line x1="47" y1="47" x2="53" y2="47" />
            <line x1="21" y1="46" x2="29" y2="46" />
            <line x1="71" y1="46" x2="79" y2="46" />
          </g>
        )}
        {glasses === 'sunglasses' && (
          <g fill="#0f172a" stroke="#000000" strokeWidth="1.5">
            <path d="M 27 42 Q 38 40 48 42 L 47 54 Q 37 57 28 52 Z" />
            <path d="M 52 42 Q 62 40 73 42 L 72 52 Q 63 57 53 54 Z" />
            <line x1="48" y1="44" x2="52" y2="44" stroke="#000000" strokeWidth="2.5" />
          </g>
        )}

        {/* ===================================================================
            LAYER 4: FOREGROUND HAIR (Bangs, front fringe, spiky crown)
           =================================================================== */}
        <g
          transform={`translate(${hairOffsetX}, ${hairOffsetY}) translate(50, 30) scale(${effHairScaleX}, ${effHairScaleY}) translate(-50, -30)`}
        >
          {hairStyle === 'short' && (
            <path
              d="M 23 48 C 21 28, 32 20, 50 20 C 68 20, 79 28, 77 48 C 74 32, 66 26, 50 26 C 34 26, 26 32, 23 48 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'buzzcut' && (
            <path
              d="M 24 45 C 23 27, 33 21, 50 21 C 67 21, 77 27, 76 45 C 73 35, 65 29, 50 29 C 35 29, 27 35, 24 45 Z"
              fill={hairColor}
              opacity="0.85"
            />
          )}

          {hairStyle === 'spiky' && (
            <path
              d="M 23 46 L 27 30 L 33 35 L 38 23 L 44 32 L 50 18 L 56 32 L 62 23 L 67 35 L 73 30 L 77 46 C 72 32, 64 26, 50 26 C 36 26, 28 32, 23 46 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'parted' && (
            <path
              d="M 22 48 C 20 26, 35 20, 50 20 C 65 20, 80 26, 78 48 C 76 34, 60 28, 48 30 C 36 26, 24 34, 22 48 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'curly' && (
            <g fill={hairColor}>
              <circle cx="28" cy="28" r="9" />
              <circle cx="39" cy="22" r="9" />
              <circle cx="50" cy="20" r="10" />
              <circle cx="61" cy="22" r="9" />
              <circle cx="72" cy="28" r="9" />
              <path d="M 24 40 C 24 30, 36 26, 50 26 C 64 26, 76 30, 76 40 C 72 32, 62 29, 50 29 C 38 29, 28 32, 24 40 Z" />
            </g>
          )}

          {hairStyle === 'long' && (
            <path
              d="M 23 42 C 23 30, 34 24, 50 24 C 66 24, 77 30, 77 42 C 73 34, 64 29, 50 29 C 36 29, 27 34, 23 42 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'bob' && (
            <path
              d="M 21 58 C 18 36, 32 20, 50 20 C 68 20, 82 36, 79 58 C 76 44, 70 30, 50 30 C 30 30, 24 44, 21 58 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'afro' && (
            <path
              d="M 26 38 C 28 26, 38 24, 50 24 C 62 24, 72 26, 74 38 C 70 30, 62 27, 50 27 C 38 27, 30 30, 26 38 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'ponytail' && (
            <path
              d="M 22 48 C 20 28, 35 22, 50 22 C 65 22, 80 28, 78 48 C 74 34, 64 28, 50 28 C 36 28, 26 34, 22 48 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'undercut' && (
            <g fill={hairColor}>
              <path d="M 26 34 C 28 21, 40 18, 52 18 C 64 18, 73 22, 73 34 C 67 25, 57 23, 48 24 C 38 25, 30 28, 26 34 Z" />
              <path d="M 26 42 Q 24 48 25 52 Q 27 50 27 42 Z" opacity="0.4" />
              <path d="M 74 42 Q 76 48 75 52 Q 73 50 73 42 Z" opacity="0.4" />
            </g>
          )}

          {hairStyle === 'dreadlocks' && (
            <g fill={hairColor}>
              <rect x="30" y="24" width="6" height="18" rx="3" />
              <rect x="38" y="22" width="6" height="20" rx="3" />
              <rect x="47" y="22" width="6" height="20" rx="3" />
              <rect x="56" y="22" width="6" height="19" rx="3" />
              <rect x="64" y="24" width="6" height="18" rx="3" />
            </g>
          )}

          {hairStyle === 'braids' && (
            <g fill={hairColor}>
              <path d="M 26 36 C 28 24, 38 22, 50 22 C 62 22, 72 24, 74 36 C 70 28, 60 26, 50 26 C 40 26, 30 28, 26 36 Z" />
            </g>
          )}

          {hairStyle === 'bun' && (
            <path
              d="M 23 44 C 22 28, 33 22, 50 22 C 67 22, 78 28, 77 44 C 73 32, 64 27, 50 27 C 36 27, 27 32, 23 44 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'wavy' && (
            <path
              d="M 22 46 C 21 28, 32 22, 50 22 C 68 22, 79 28, 78 46 C 74 34, 66 28, 50 28 C 34 28, 26 34, 22 46 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'side_fringe' && (
            <path
              d="M 22 48 C 20 28, 35 20, 50 20 C 65 20, 78 26, 78 46 C 72 32, 58 26, 44 32 C 34 36, 26 44, 22 48 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'middle_part' && (
            <path
              d="M 22 48 C 21 26, 34 20, 48 24 C 42 34, 32 40, 24 45 C 24 38, 23 46, 22 48 Z M 78 48 C 79 26, 66 20, 52 24 C 58 34, 68 40, 76 45 C 76 38, 77 46, 78 48 Z"
              fill={hairColor}
            />
          )}
        </g>

        {/* ===================================================================
            LAYER 5: HEADWEAR (Hooftooien, petten, hoeden, mutsen, kronen)
           =================================================================== */}
        {headwear !== 'none' && (
          <g
            transform={`translate(${headwearOffsetX}, ${headwearOffsetY}) translate(50, 25) scale(${effHeadwearScaleX}, ${effHeadwearScaleY}) translate(-50, -25)`}
          >
            {headwear === 'cap' && (
              <g>
                {/* Cap Dome */}
                <path
                  d="M 20 34 C 20 12, 32 10, 50 10 C 68 10, 80 12, 80 34 Z"
                  fill={actualHeadwearColor}
                />
                {/* Cap Visor */}
                <path
                  d="M 16 34 C 18 30, 45 30, 84 34 C 78 40, 22 40, 16 34 Z"
                  fill={actualHeadwearColor}
                  filter="brightness(0.85)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                {/* Cap Top Button */}
                <circle cx="50" cy="10" r="2.5" fill="#ffffff" />
              </g>
            )}

            {headwear === 'beanie' && (
              <g>
                {/* Beanie Dome */}
                <path
                  d="M 22 35 C 20 12, 33 8, 50 8 C 67 8, 80 12, 78 35 Z"
                  fill={actualHeadwearColor}
                />
                {/* Ribbed Band */}
                <rect
                  x="20"
                  y="30"
                  width="60"
                  height="8"
                  rx="3"
                  fill={actualHeadwearColor}
                  filter="brightness(0.8)"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
                {/* Pompom */}
                <circle cx="50" cy="6" r="4.5" fill="#ffffff" />
              </g>
            )}

            {headwear === 'party_hat' && (
              <g>
                <polygon points="50,2 32,32 68,32" fill={actualHeadwearColor} />
                <path d="M 38,22 L 62,22" stroke="#ffffff" strokeWidth="2.5" />
                <path d="M 43,14 L 57,14" stroke="#fde047" strokeWidth="2.5" />
                <circle cx="50" cy="2" r="3.5" fill="#fde047" />
              </g>
            )}

            {headwear === 'crown' && (
              <g fill="#fbbf24" stroke="#d97706" strokeWidth="1">
                <polygon points="22,34 22,18 36,26 50,14 64,26 78,18 78,34" />
                {/* Jewels */}
                <circle cx="50" cy="24" r="2" fill="#ef4444" stroke="none" />
                <circle cx="36" cy="28" r="1.5" fill="#3b82f6" stroke="none" />
                <circle cx="64" cy="28" r="1.5" fill="#10b981" stroke="none" />
              </g>
            )}

            {headwear === 'cowboy' && (
              <g>
                {/* Hat Crown */}
                <path
                  d="M 33 26 C 33 12, 40 8, 50 11 C 60 8, 67 12, 67 26 Z"
                  fill={actualHeadwearColor}
                />
                {/* Hat Band */}
                <rect x="33" y="24" width="34" height="4" fill="#1e1b4b" opacity="0.6" />
                {/* Wide Curved Brim */}
                <path
                  d="M 12 30 Q 18 24 50 26 Q 82 24 88 30 Q 84 37 50 34 Q 16 37 12 30 Z"
                  fill={actualHeadwearColor}
                  filter="brightness(0.9)"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
              </g>
            )}

            {headwear === 'bandana' && (
              <g>
                <path
                  d="M 21 28 Q 50 20 79 28 L 78 36 Q 50 28 22 36 Z"
                  fill={actualHeadwearColor}
                />
                <circle cx="50" cy="28" r="2.5" fill="#ffffff" />
                <path d="M 48 30 L 45 35" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 52 30 L 55 35" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}

            {headwear === 'beret' && (
              <g>
                <ellipse cx="50" cy="20" rx="30" ry="12" fill={actualHeadwearColor} transform="rotate(-6 50 20)" />
                <path d="M 28 26 Q 50 24 70 28" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.4" />
                <line x1="49" y1="8" x2="49" y2="4" stroke={actualHeadwearColor} strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}

            {headwear === 'chef' && (
              <g fill="#ffffff" stroke="#cbd5e1" strokeWidth="1">
                <path d="M 33 28 C 30 18, 25 14, 34 8 C 42 2, 58 2, 66 8 C 75 14, 70 18, 67 28 Z" fill="#ffffff" />
                <rect x="31" y="26" width="38" height="8" rx="1.5" fill="#f8fafc" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
