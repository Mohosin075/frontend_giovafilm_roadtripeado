import { baseApi } from "@/redux/api/baseApi";

export interface IRouteStopPayload {
  place?: string;
  business?: string;
  type?: "Place" | "Business";
  order?: number;
  note?: string;
}

export interface IRoutePlanPayload {
  name: string;
  description?: string;
  stops?: IRouteStopPayload[];
  isPublic?: boolean;
}

export const routePlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoutePlan: builder.mutation<any, IRoutePlanPayload>({
      query: (body) => ({
        url: "/route-plan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RoutePlan"],
    }),

    getMyRoutePlans: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/route-plan/my-routes",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["RoutePlan"],
    }),

    getRoutePlanById: builder.query<any, string>({
      query: (id) => ({
        url: `/route-plan/${id}`,
        method: "GET",
      }),
      providesTags: ["RoutePlan"],
    }),

    updateRoutePlan: builder.mutation<any, { id: string; data: Partial<IRoutePlanPayload> }>({
      query: ({ id, data }) => ({
        url: `/route-plan/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["RoutePlan"],
    }),

    deleteRoutePlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/route-plan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RoutePlan"],
    }),

    clearRouteStops: builder.mutation<any, string>({
      query: (id) => ({
        url: `/route-plan/${id}/clear`,
        method: "POST",
      }),
      invalidatesTags: ["RoutePlan"],
    }),

    addStopToRoute: builder.mutation<any, { id: string; stop: IRouteStopPayload }>({
      query: ({ id, stop }) => ({
        url: `/route-plan/${id}/stops`,
        method: "POST",
        body: stop,
      }),
      invalidatesTags: ["RoutePlan"],
    }),

    removeStopFromRoute: builder.mutation<any, { id: string; stopId: string }>({
      query: ({ id, stopId }) => ({
        url: `/route-plan/${id}/stops/${stopId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RoutePlan"],
    }),
  }),
});

export const {
  useCreateRoutePlanMutation,
  useGetMyRoutePlansQuery,
  useGetRoutePlanByIdQuery,
  useUpdateRoutePlanMutation,
  useDeleteRoutePlanMutation,
  useClearRouteStopsMutation,
  useAddStopToRouteMutation,
  useRemoveStopFromRouteMutation,
} = routePlanApi;
