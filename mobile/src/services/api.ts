import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/config";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "API REQUEST:",
      `${config.baseURL ?? ""}${config.url ?? ""}`
    );

    console.log(
      "TOKEN:",
      token ? "Present" : "Missing"
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;