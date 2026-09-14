import { queryOptions } from "@tanstack/react-query";
import { API } from "../config.js";

const EMPTY_KWARA_BOUNDARIES = { state: null, lgas: null };

export const kwaraBoundariesQuery = queryOptions({
  queryKey: ["boundaries", "kwara"],
  queryFn: async ({ signal }) => {
    const response = await fetch(`${API}/boundaries/kwara`, { signal });
    if (!response.ok) {
      const error = new Error("Boundary service unavailable");
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return {
      state: data.state || null,
      lgas: data.lgas || null,
    };
  },
  staleTime: 24 * 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  placeholderData: EMPTY_KWARA_BOUNDARIES,
});
