// Auth now lives in a single app-wide context (one subscription for the whole
// app). This module is kept as a stable import path — `useAuth` and `Profile`
// are re-exported from the provider.
export { useAuth, AuthProvider, type Profile } from "./AuthProvider";
