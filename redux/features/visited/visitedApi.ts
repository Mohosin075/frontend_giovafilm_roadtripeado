import { baseApi } from "@/redux/api/baseApi";

const visitedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    toggleVisited: builder.mutation<any, { placeId: string; type?: string }>({
      query: (body) => ({
        url: `/visited/toggle`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Visited", "User", "Place"],
    }),

    getMyVisitedPlaces: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: `/visited/my-places`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Visited"],
    }),

    getVisitedCount: builder.query<any, void>({
      query: () => ({
        url: `/visited/count`,
        method: "GET",
      }),
      providesTags: ["Visited"],
    }),
  }),
});

export const {
  useToggleVisitedMutation,
  useGetMyVisitedPlacesQuery,
  useGetVisitedCountQuery,
} = visitedApi;
