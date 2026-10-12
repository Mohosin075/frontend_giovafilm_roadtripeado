import { baseApi } from "@/redux/api/baseApi";

const favouriteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addToFavourite: builder.mutation<void, any>({
      query: (body) => ({
        url: `/favourite`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Favourite"],
    }),

    removeFavourite: builder.mutation<void, string>({
      query: (id) => ({
        url: `/favourite/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favourite"],
    }),

    getFavourites: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: `/favourite`,
        method: "GET",
        params: { limit: 1000, ...(params || {}) },
      }),
      providesTags: ["Favourite"],
    }),
  }),
});

export const {
  useAddToFavouriteMutation,
  useRemoveFavouriteMutation,
  useGetFavouritesQuery,
} = favouriteApi;
