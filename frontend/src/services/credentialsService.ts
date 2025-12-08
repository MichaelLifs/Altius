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

      // Parse response - could be success or error
      let responseData: any;
      try {
        responseData = await response.json();
      } catch {
        // If response is not JSON, treat as error
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      if (response.status === 401) {
        // Check if it's a session/auth token error or invalid credentials
        // FastAPI returns 'detail' field for HTTPException
        const errorMessage = responseData?.detail || responseData?.message || "Failed to submit credentials";
        
        // If it's about invalid credentials for the website, don't logout
        if (errorMessage.includes("Invalid username or password for this website") || 
            errorMessage.includes("Invalid username") || 
            errorMessage.includes("Invalid password")) {
          throw new Error(errorMessage);
        }
        
        // Otherwise, it's a session/auth token error - logout and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorMessage = responseData?.detail || responseData?.message || "Failed to submit credentials";
        throw new Error(errorMessage);
      }

      return responseData as CredentialsResponse;

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
