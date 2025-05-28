import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const openLibraryApiClient = axios.create({
  baseURL: "https://openlibrary.org",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

openLibraryApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ success: false, message: "Unknown error" });
  }
);

export const queryClient = new QueryClient();
