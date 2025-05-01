"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useDebugValue,
  useCallback,
} from "react";
import NextScript from "next/script.js";
import type { ScriptProps } from "next/script.js";

export const HUBSPOT_LOADED_EVENT = "hubspot_loaded";

// https://github.com/vercel/next.js/issues/46078
const Script = NextScript as unknown as React.FC<ScriptProps>;

export interface HubspotContextProps {
  /** If `true`, Hubspot script has been loaded */
  readonly isScriptLoaded: boolean;
  /** If `true`, an error occurred while loading Hubspot script */
  readonly isScriptError: boolean;
  /** Error received while loading Hubspot script */
  readonly scriptError: Error | null;
}

export const HubspotContext = createContext<HubspotContextProps>({
  isScriptLoaded: false,
  isScriptError: false,
  scriptError: null,
});

export const useHubspotContext = () => {
  const values = useContext(HubspotContext);
  useDebugValue(`isScriptLoaded: ${String(values.isScriptLoaded)}`);
  useDebugValue(`isScriptError: ${String(values.isScriptError)}`);
  useDebugValue(`scriptError: ${values.scriptError}`);
  return values;
};

export interface HubspotProviderProps extends Partial<ScriptProps> {
  children?: React.ReactNode;
}

/** Loads Hubspot script to the document and syncs loading state between forms on the page */
export const HubspotProvider: React.FC<HubspotProviderProps> = ({
  children,

  strategy = "afterInteractive",

  src: passedSrc,
  onReady: passedOnReady,
  onError: passedOnError,

  ...props
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<Error | null>(null);

  const isScriptError = !!scriptError;

  const src = passedSrc || "https://js.hsforms.net/forms/v2.js";

  // Handle script load
  const onReady = useCallback(() => {
    setScriptError(null);
    setIsScriptLoaded(true);
    window.dispatchEvent(new Event(HUBSPOT_LOADED_EVENT));
    passedOnReady?.();
  }, [passedOnReady]);

  // Handle script error
  const onError = useCallback(
    (e: Error) => {
      console.error("HubSpot script failed to load:", e);
      setScriptError(e);
      passedOnError?.(e);
    },
    [passedOnError],
  );

  // Prevent unnecessary rerenders
  const value: HubspotContextProps = useMemo(
    () => ({
      isScriptLoaded,
      isScriptError,
      scriptError,
    }),
    [isScriptLoaded, isScriptError, scriptError],
  );

  return (
    <HubspotContext.Provider value={value}>
      {children}
      <Script src={src} strategy={strategy} onReady={onReady} onError={onError} {...props} />
    </HubspotContext.Provider>
  );
};
