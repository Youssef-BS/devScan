import { api } from "@/lib/axios";

interface AdminLoginResponse {
  message: string;
  admin?: { email: string; role: "ADMIN" };
}

export const AdminLogin = async (
  email: string,
  password: string
): Promise<AdminLoginResponse> => {
  try {
    const response = await api.post("/admin/login", {
      email,
      password,
    });

    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Login failed";
    throw new Error(msg);
  }
};

export const fetchCurrentAdmin = async () => {
  try {
    const response = await api.get("/admin/current");
    return response.data.admin || null;
  } catch (error: any) {
    console.error(
      "Failed to fetch current admin:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

export const logoutAdmin = async () => {
  try {
    await api.post("/admin/logout");
  } catch (error: any) {
    console.error(
      "Logout failed:",
      error.response?.data?.message || error.message
    );
  }
};