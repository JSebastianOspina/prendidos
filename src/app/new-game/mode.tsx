import { Redirect } from 'expo-router';

import { routes } from '@/features/navigation/routes';

/** The mode is chosen on Inicio now; the old route only sends people there. */
export default function ModeRoute() {
  return <Redirect href={routes.home} />;
}
