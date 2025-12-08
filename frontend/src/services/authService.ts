const API_URL = import.meta.env.VITE_API_URL || "/api";

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    role: string | null;
    is_verified: boolean;
    token?: string;
  };
}

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: string | null;
  is_verified: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || "Invalid email or password");
      }

      if (data.data) {
        const userData = { ...data.data };
        delete userData.token;
        localStorage.setItem("user", JSON.stringify(userData));
        
        if (data.data.token) {
          localStorage.setItem("token", data.data.token);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error("Request timeout. Please check your connection and try again.");
        }
        throw error;
      }
      throw new Error("Invalid email or password");
    }
  },

  logout(): void {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  },
};
