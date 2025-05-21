import axios from "axios";

// Function to get the current token from localStorage
export const getToken = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "";
  }
  return "";
};

// Function to update the token
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Function to remove the token
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to ensure we have the latest
    const token = localStorage.getItem("token") || "";

    // Ensure headers object exists
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";

    // Add auth header if token exists
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No authentication token found for request:", config.url);
    }

    console.log(
      `[API Request] ${config.method?.toUpperCase() || "GET"} ${config.url}`,
      {
        params: config.params,
        headers: config.headers,
      }
    );

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response: import("axios").AxiosResponse) => {
    console.log(
      `[API Response] ${response.config?.method?.toUpperCase() || "GET"} ${
        response.config?.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  (error: import("axios").AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("[API Response Error]", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.config?.headers,
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn("Authentication required, redirecting to login");
        // You might want to redirect to login here
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("[API Request Error] No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("[API Error]", error.message);
    }

    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error(
      "API Error:",
      error.config?.url,
      error.response?.status,
      error.message
    );
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh-token", {
            refreshToken,
          });
          const { token, user } = response.data;

          // Update tokens and user data
          setToken(token);
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Update the Authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401) {
      // If we already tried to refresh the token but still got 401, redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
