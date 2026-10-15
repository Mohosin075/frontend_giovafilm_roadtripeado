import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setAccessToken } from "../features/auth/authSlice";

import { env } from "@/lib/config";

const baseURL = env.NEXT_PUBLIC_BASEURL;

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseURL}/api/v1`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("app_language") || "es";
      headers.set("Accept-Language", savedLang);
    } else {
      headers.set("Accept-Language", "es");
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  // console.log(result);

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as any;
      if (data.success) {
        api.dispatch(setAccessToken(data.data.accessToken));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "Map",
    "Category",
    "Place",
    "Offer",
    "Business",
    "Stats",
    "Review",
    "Subscription",
    "Favourite",
    "Visited",
    "Award",
    "Promo",
    "Notification",
    "RoutePlan",
  ],
  endpoints: () => ({}),
});
