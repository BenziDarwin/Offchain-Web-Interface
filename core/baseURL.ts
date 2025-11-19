import axios from "axios";

const baseUrl = process.env.BASE_URL;

export const AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
  "Content-Type": "application/json",
    Accept: "application/json",
  }
});
