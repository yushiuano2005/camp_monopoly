import _axios from "axios";

const instance = _axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://eecamp-monopoly.ntuee.org/api",
  timeout: 2000,
});

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("operatorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
