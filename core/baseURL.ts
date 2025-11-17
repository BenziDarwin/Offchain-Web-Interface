import axios from "axios";

const baseUrl = "http://localhost:7671";

export const AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
  "Content-Type": "application/json",
    Accept: "application/json",
  }
});
