// Reanimated's Jest helpers: mocks the native runtime and adds `toHaveAnimatedStyle`.
// https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/
import { setUpTests } from 'react-native-reanimated';
// The matcher's global typing ships only in the native entry's declarations.
import type {} from 'react-native-reanimated/lib/typescript/jestUtils/index.native';

setUpTests();
