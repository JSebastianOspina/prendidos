import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useDeviceState } from '@/features/device/device-state-provider';

/** Placeholder until HU-01. Confirming unlocks the protected routes and leaves this screen. */
export default function AgeGateScreen() {
  const { confirmAge } = useDeviceState();
  return (
    <PlaceholderScreen
      title="Confirmación 18+"
      story="HU-01"
      nextLabel="Soy mayor de 18"
      onNext={confirmAge}
    />
  );
}
