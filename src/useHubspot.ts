import { useDebugValue, useMemo, useSyncExternalStore } from "react";

import { HUBSPOT_LOADED_EVENT, HubspotContextProps, useHubspotContext } from "./HubspotProvider.js";

import type { Hubspot, Hbspt } from "./hubspot.types.js";

const subscribe = (callback: () => void) => {
  window.addEventListener(HUBSPOT_LOADED_EVENT, callback);
  return () => window.removeEventListener(HUBSPOT_LOADED_EVENT, callback);
};

const getHubspot = () => window.hubspot || null;

const getHbspt = () => window.hbspt || null;

const getServerSnapshot = () => null;

export interface useHubspotResult extends HubspotContextProps {
  /** Global Hubspot object */
  readonly hubspot: Hubspot | null;
  /** Hbspt object, used to create forms */
  readonly hbspt: Hbspt | null;
}

/**
 * A custom hook that provides access to HubSpot-related data and functionality.
 *
 * This hook combines context data from `useHubspotContext` with synchronized external
 * store values for `hubspot` and `hbspt`.
 *
 * @returns An object containing:
 * - `hubspot`: Global window HubSpot object or `null` if not loaded.
 * - `hbspt`: Global window Hbspt object or `null` if not loaded.
 * - Additional context data from `useHubspotContext`.
 */
export const useHubspot = (): useHubspotResult => {
  const context = useHubspotContext();

  const hubspot = useSyncExternalStore(subscribe, getHubspot, getServerSnapshot);
  const hbspt = useSyncExternalStore(subscribe, getHbspt, getServerSnapshot);

  useDebugValue(`hubspot: `, hubspot);
  useDebugValue(`hbspt: `, hbspt);

  const value: useHubspotResult = useMemo(
    () => ({
      ...context,
      hubspot,
      hbspt,
    }),
    [context, hubspot, hbspt],
  );

  return value;
};
