const API_URL = import.meta.env.VITE_API_URL || "/api";

interface Website {
  id: number;
  website_id: string;
  name: string;
  url: string | null;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface WebsiteListResponse {
  success: boolean;
  count: number;
  data: Website[];
}

export const websiteService = {
  async getUserWebsites(): Promise<WebsiteListResponse> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    try {
      const response = await fetch(`${API_URL}/websites/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please login again.");
      }

      const data: WebsiteListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch websites");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch websites");
    }
  },
};


