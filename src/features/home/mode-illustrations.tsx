import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { BorderWidth, Colors } from '@/constants/theme';

/** Wraps decorative art so screen readers and touches skip it. */
function Decoration({ style, children }: { style: ViewStyle; children: ReactNode }) {
  return (
    <View
      style={style}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </View>
  );
}

type Circle = { centerX: number; centerY: number; radius: number; fill: string };

/** Outlined disc positioned by its center, like an SVG `<circle>`. */
function circleStyle({ centerX, centerY, radius, fill }: Circle): ViewStyle {
  return {
    position: 'absolute',
    left: centerX - radius,
    top: centerY - radius,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    backgroundColor: fill,
  };
}

const friendsWidth = 150;
const friendsHeight = 110;
/** Back to front: the smiling friend sits in the middle, drawn over the left one. */
const friendCircles: readonly Circle[] = [
  { centerX: 40, centerY: 44, radius: 26, fill: Colors.surfaceSoft },
  { centerX: 80, centerY: 34, radius: 30, fill: Colors.levelEasy },
  { centerX: 118, centerY: 48, radius: 24, fill: Colors.points },
];
const eyeRadius = 3.5;
const smileWidth = 16;
const smileHeight = 8;

/** Amigos: three overlapping friends, the middle one smiling. */
export function FriendsIllustration({ style }: { style: ViewStyle }) {
  return (
    <Decoration style={{ ...style, width: friendsWidth, height: friendsHeight }}>
      {friendCircles.map((circle) => (
        <View key={circle.centerX} style={[circleStyle(circle), styles.outlined]} />
      ))}
      <View style={circleStyle({ centerX: 72, centerY: 30, radius: eyeRadius, fill: Colors.ink })} />
      <View style={circleStyle({ centerX: 88, centerY: 30, radius: eyeRadius, fill: Colors.ink })} />
      <View style={styles.smile} />
    </Decoration>
  );
}

const heartSide = 52;
const heartOutline = BorderWidth.regular;
/** Distance from the square's center to the midpoint of an upper edge, on each axis. */
const lobeOffset = heartSide / (2 * Math.SQRT2);
const heartWidth = Math.ceil(2 * (lobeOffset + heartSide / 2 + heartOutline));
const heartCenterX = heartWidth / 2;
const heartCenterY = lobeOffset + heartSide / 2 + heartOutline;
/** The tip is the bottom corner of the outline square. */
const heartHeight = Math.ceil(heartCenterY + (heartSide + 2 * heartOutline) / Math.SQRT2);

/** One heart silhouette: a 45° square and two lobes; `grow` thickens it into the outline layer. */
function HeartLayer({ grow, fill }: { grow: number; fill: string }) {
  const squareSide = heartSide + 2 * grow;
  const lobeRadius = heartSide / 2 + grow;
  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: heartCenterX - squareSide / 2,
          top: heartCenterY - squareSide / 2,
          width: squareSide,
          height: squareSide,
          backgroundColor: fill,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {[-lobeOffset, lobeOffset].map((offsetX) => (
        <View
          key={offsetX}
          style={circleStyle({
            centerX: heartCenterX + offsetX,
            centerY: heartCenterY - lobeOffset,
            radius: lobeRadius,
            fill,
          })}
        />
      ))}
    </>
  );
}

/** Pareja: a cream heart with an ink outline (the ink layer peeks out around the fill). */
export function CoupleIllustration({ style }: { style: ViewStyle }) {
  return (
    <Decoration style={{ ...style, width: heartWidth, height: heartHeight }}>
      <HeartLayer grow={heartOutline} fill={Colors.ink} />
      <HeartLayer grow={0} fill={Colors.background} />
    </Decoration>
  );
}

const styles = StyleSheet.create({
  outlined: {
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
  },
  smile: {
    position: 'absolute',
    left: 80 - smileWidth / 2,
    top: 38,
    width: smileWidth,
    height: smileHeight,
    borderWidth: BorderWidth.regular,
    borderTopWidth: 0,
    borderColor: Colors.ink,
    borderBottomLeftRadius: smileWidth / 2,
    borderBottomRightRadius: smileWidth / 2,
  },
});
