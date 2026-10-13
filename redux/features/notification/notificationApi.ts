import { baseApi } from "@/redux/api/baseApi";

export interface INotificationItem {
  _id: string;
  category: "account" | "roadtripeado";
  type: string;
  title: string | { en: string; es: string };
  content: string | { en: string; es: string };
  actionUrl?: string;
  actionText?: string | { en: string; es: string };
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface IUnreadCount {
  totalUnread: number;
  unreadAccount: number;
  unreadRoadtripeado: number;
  byType: Record<string, number>;
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<
      { meta: any; data: INotificationItem[] },
      { category?: string; type?: string; isRead?: boolean | string; page?: number; limit?: number; searchTerm?: string }
    >({
      query: (params) => ({
        url: "/notifications/my",
        method: "GET",
        params,
      }),
      providesTags: ["Notification"],
      transformResponse: (response: any) => {
        if (response && Array.isArray(response.data)) {
          return {
            meta: response.meta || null,
            data: response.data,
          };
        }
        if (Array.isArray(response)) {
          return {
            meta: null,
            data: response,
          };
        }
        return {
          meta: response?.meta || null,
          data: response?.data || [],
        };
      },
    }),

    getUnreadCount: builder.query<IUnreadCount, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
      transformResponse: (response: any) => response.data,
    }),

    markAsRead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<any, { category?: string; type?: string } | void>({
      query: (body) => ({
        url: "/notifications/read-all",
        method: "PATCH",
        body: body || {},
      }),
      invalidatesTags: ["Notification"],
    }),

    archiveNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notifications/${id}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    clearMyNotifications: builder.mutation<any, { category?: string; type?: string; onlyRead?: boolean } | void>({
      query: (body) => ({
        url: "/notifications/my/clear",
        method: "DELETE",
        body: body || {},
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useArchiveNotificationMutation,
  useClearMyNotificationsMutation,
} = notificationApi;
