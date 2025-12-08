const API_URL = import.meta.env.VITE_API_URL || "/api";

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: string | null;
  is_verified: boolean;
}

interface UpdateUserData {
  name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  data?: User;
}

const userService = {
  async updateUser(userId: number, userData: UpdateUserData): Promise<User> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please login again.");
      }

      const data: UserResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to update user");
      }

      localStorage.setItem("user", JSON.stringify(data.data));

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update user");
    }
  },
};

export { userService };
