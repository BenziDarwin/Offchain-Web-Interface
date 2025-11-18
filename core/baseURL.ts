import axios from "axios";

const baseUrl = "http://84.247.167.128:7671";

export const AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
  "Content-Type": "application/json",
    Accept: "application/json",
  }
});
