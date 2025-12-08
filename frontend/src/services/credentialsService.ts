const API_URL = import.meta.env.VITE_API_URL || "/api";

interface CredentialsRequest {
  website: string;
  username: string;
  password: string;
}

interface CredentialsResponse {
  success: boolean;
  message: string;
  token: string;
  deals: string[];
}

const credentialsService = {
  async submitCredentials(
    credentials: CredentialsRequest
  ): Promise<CredentialsResponse> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const response = await fetch(`${API_URL}/credentials/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(credentials),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please login again.");
      }

      const data: CredentialsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit credentials");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to submit credentials");
    }
  },
};

export { credentialsService };
