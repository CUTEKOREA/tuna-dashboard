import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';

const PORT_LABELS: Record<string, string> = {
  BKK: '방콕',
  GENSAN: '젠산',
  RABAUL: '라바울',
  TAHITI: '타히티',
  TEMA: '테마',
  'X-MAS': '크리스마스섬',
};

export function formatFleetDailyDelta(value: number) {
  return `${value > 0 ? '+' : ''}${value.toLocaleString('ko-KR', { maximumFractionDigits: 3 })}`;
}

export function formatFleetDailyNote(note: string) {
  return Object.entries(PORT_LABELS).reduce(
    (localized, [source, label]) => localized.replaceAll(source, label),
    note,
  );
}

export function resolveCarrierReportedLocation(note: string) {
  for (const position of ['BKK', 'GENSAN', 'RABAUL', 'X-MAS'] as const) {
    if (note.includes(position)) return { position, location: PORT_LABELS[position] };
  }
  return { position: null, location: null };
}

function displayLocation(position: string) {
  return PORT_LABELS[position] ?? position;
}

export function buildFleetRoster(detail: FleetDailyDetailPayload) {
  const pacific = detail.pacific.vessels.map((vessel) => ({
    ...vessel,
    displayName: vessel.name,
    zone: vessel.position,
    location: displayLocation(vessel.position),
    status: 'reported' as const,
  }));
  const atlantic = detail.atlantic.vessels.map((vessel) => ({
    ...vessel,
    displayName: vessel.name,
    zone: vessel.position,
    location: displayLocation(vessel.position),
    status: 'reported' as const,
  }));
  const carrier = detail.carrier.vessels.map((vessel) => {
    const reportedLocation = resolveCarrierReportedLocation(vessel.note);
    return {
      ...vessel,
      ...reportedLocation,
      zone: reportedLocation.position ?? '',
      status: 'reported' as const,
    };
  });
  const longline = detail.longline.vessels.map((vessel) => ({
    ...vessel,
    displayName: vessel.name,
    status: 'reported' as const,
  }));

  return {
    pacific,
    atlantic,
    carrier,
    carrierPhysical: carrier.filter((vessel) => vessel.entityType === 'vessel'),
    longline,
  };
}

export type FleetRoster = ReturnType<typeof buildFleetRoster>;
