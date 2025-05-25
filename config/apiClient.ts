import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const openLibraryApiClient = axios.create({
  baseURL: "https://openlibrary.org",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const queryClient = new QueryClient();
