import { toast } from "@/hooks/use-toast";
import { get } from "http";

const API_URL = import.meta.env.VITE_API_URL!;

interface ApiResponse<T> {
  status?: "success" | "failed";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
  events?: Event[];
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Error: ${response.status}`;
    toast({
      title: "API Error",
      description: errorMessage,
      variant: "destructive",
    });
    return { status: "failed", error: errorMessage };
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return { status: "success" };
  }

  const data = await response.json();
  return data;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("auth_tokens");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    const parsedToken = JSON.parse(token);

    headers["Authorization"] = `Bearer ${parsedToken.accessToken}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    return handleResponse<T>(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    toast({
      title: "Network Error",
      description: errorMessage,
      variant: "destructive",
    });
    return { status: "failed", error: errorMessage };
  }
}

// Event API
export interface Event {
  eventID: string;
  name: string;
  description: string;
  eventDate: string;
  locationTitle: string;
  location: number[];
  capacity: number;
  bannerURL: string;
  category: string;
  organizer: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  createdAt: string;
  updatedAt?: string;
  eventAttendees?: { userID: string; fullName: string }[];
}

export const eventApi = {
  getAllEvents: () => request<Event[]>("/events"),
  getEventById: (id: string) => request<Event>(`/events/${id}`),
  getMyOrganizedEvents: () =>
    request<Event[]>("/user/organizedEvents", {
      method: "GET",
    }),
  getMyJoinedEvents: () =>
    request<Event[]>("/user/joinedEvents", {
      method: "GET",
    }),
  createEvent: async (
    event: Omit<
      Event,
      "eventID" | "organizerID" | "createdAt" | "updatedAt" | "organizer"
    >
  ) => {
    return request<void>("/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  },
  updateEvent: (
    id: string,
    event: Omit<
      Event,
      "eventID" | "organizerID" | "createdAt" | "updatedAt" | "organizer"
    >
  ) =>
    request<void>(`/events/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    }),
  deleteEvent: (id: string) =>
    request<void>(`/events/${id}`, { method: "DELETE" }),

  getAIDescription: (name: string, description: string) =>
    request<void>(`/ai/description`, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
};

// Notification API
export interface Notification {
  id?: string;
  userID: string;
  eventID: string;
  description: string;
  type: "invite" | "update";
  createdAt: string;
}

export const notificationApi = {
  getAllNotifications: () => request<Notification[]>("/notifications"),
  getNotificationById: (id: string) =>
    request<Notification>(`/notifications/${id}`),
  createNotification: (notification: Omit<Notification, "id">) =>
    request<void>("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    }),
  deleteNotification: (id: string) =>
    request<void>(`/notifications/${id}`, { method: "DELETE" }),
};

// Invite API
export interface Invite {
  id?: string;
  senderID: string;
  receiverID: string;
  eventID: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export const inviteApi = {
  getAllInvites: () => request<Invite[]>("/invites"),
  sendInvite: (invite: Omit<Invite, "id">) =>
    request<void>("/invites", { method: "POST", body: JSON.stringify(invite) }),
  deleteInvite: (id: string) =>
    request<void>(`/invites/${id}`, { method: "DELETE" }),
};

// Waitlist API
export interface Waitlist {
  id?: string;
  userID: string;
  eventID: string;
  joinedAt: string;
}

export const waitlistApi = {
  getAllWaitlistEntries: () => request<Waitlist[]>("/waitlist"),
  addToWaitlist: (waitlist: Omit<Waitlist, "id">) =>
    request<void>("/waitlist", {
      method: "POST",
      body: JSON.stringify(waitlist),
    }),
};

export const attendanceApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllAttendanceRecords: () => request<any>("/attendance"),
  recordAttendance: (eventId) =>
    request<void>(`/events/join/${eventId}`, {
      method: "POST",
    }),
};

export const emailApi = {
  sendContactRequest: async (
    attendee: { fullName: string; email: string },
    organizer: { fullName: string; email: string },
    message: string,
    event: Event,
  ) => {
    try {
      const response = await request<any>(`/email/contactOrganizer`, {
        method: "POST",
        body: JSON.stringify({
          event,
          message,
          attendee,
          organizer,
        }),
      });

      if (response.status === "success") {
        toast({
          title: "Message Sent",
          description: "Your message has been sent to the organizer successfully.",
        });
        return true;
      } else {
         // Handle error response
        toast({
          title: "Failed to Send Message",
          description: response.error || "An error occurred while sending the message.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to send the message. Please try again later.",
        variant: "destructive",
      });
    }
  },
}
