import "bootstrap-icons/font/bootstrap-icons.css";
import React, { Fragment, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css";
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import ChatbotComponent from "./components/Chatbot/ChatbotComponent";
import { routes } from "./routes";
import { isJsonString } from "./utils";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "./redux/slides/userSlide";
import * as UserService from "./services/UserService";
import * as AdminService from "./services/AdminService";
import axios from "axios";
import { updateAdmin } from "./redux/slides/adminSlide";
function App() {
  // console.log('url', process.env.REACT_APP_API_URL_BACKEND)
  //   useEffect(()=>{
  //     fetchApi()
  //   }, [])

  //   const fetchApi = async () => {
  //     const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/product/get-all`);
  //     return res.data;
  // };

  //   const query = useQuery({ queryKey: ['todos'], queryFn: fetchApi })

  //   console.log('query', query)

  const dispatch = useDispatch();

  useEffect(() => {
    const { storageData, decoded } = handleDecoded();
    if (!decoded || !decoded.id) {
      console.log("No valid token found or user is logged out");
      return; // Exit early if no valid token or ID is found
    }

    if (decoded?.isAdmin) {
      handleGetDetailsAdmin(decoded?.id, storageData);
    } else {
      handleGetDetailsUser(decoded?.id, storageData);
    }
  }, []);

  const handleDecoded = () => {
    let storageData = localStorage.getItem("access_token");
    let decoded = null;

    if (storageData && isJsonString(storageData)) {
      try {
        storageData = JSON.parse(storageData);
        decoded = jwtDecode(storageData);

        // Verify the token has not expired
        const currentTime = new Date().getTime() / 1000;
        if (decoded.exp < currentTime) {
          console.log("Token has expired");
          localStorage.removeItem("access_token"); // Clear expired token
          return { decoded: null, storageData: null };
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("access_token"); // Clear invalid token
        return { decoded: null, storageData: null };
      }
    }

    return { decoded, storageData };
  };

  UserService.axiosJWT.interceptors.request.use(
    async (config) => {
      const currentTime = new Date();
      const { decoded, storageData } = handleDecoded();

      if (!decoded || !storageData) {
        return config;
      }

      if (decoded?.exp < currentTime.getTime() / 1000) {
        try {
          const data = await UserService.refreshToken();
          if (data && data.access_token) {
            config.headers["token"] = `Bearer ${data.access_token}`;
            // Update localStorage with new token
            localStorage.setItem("access_token", JSON.stringify(data.access_token));
          } else {
            // If refresh token fails, clear localStorage and let request continue
            localStorage.removeItem("access_token");
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          localStorage.removeItem("access_token");
        }
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  AdminService.axiosJWT.interceptors.request.use(
    async (config) => {
      const currentTime = new Date();
      const { decoded, storageData } = handleDecoded();

      if (!decoded || !storageData) {
        return config;
      }

      if (decoded?.exp < currentTime.getTime() / 1000) {
        try {
          const data = await AdminService.refreshToken();
          if (data && data.access_token) {
            config.headers["token"] = `Bearer ${data.access_token}`;
            // Update localStorage with new token
            localStorage.setItem("access_token", JSON.stringify(data.access_token));
          } else {
            // If refresh token fails, clear localStorage and let request continue
            localStorage.removeItem("access_token");
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          localStorage.removeItem("access_token");
        }
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  const handleGetDetailsUser = async (id, token) => {
    if (!id || !token) {
      console.log("Missing user ID or token, skipping user details fetch");
      return;
    }

    try {
      const res = await UserService.getDetailsUser(id, token);
      dispatch(updateUser({ ...res?.data, access_token: token }));
    } catch (error) {
      console.error("Error fetching user details:", error);
      // If we get a 404, the user might be deleted or invalid token
      if (error.response && error.response.status === 404) {
        localStorage.removeItem("access_token"); // Clear token
      }
    }
  };

  const handleGetDetailsAdmin = async (id, token) => {
    if (!id || !token) {
      console.log("Missing admin ID or token, skipping admin details fetch");
      return;
    }

    try {
      const res = await AdminService.getDetailsAdmin(id, token);
      dispatch(updateAdmin({ ...res?.data, access_token: token }));
    } catch (error) {
      console.error("Error fetching admin details:", error);
      // If we get a 404, the admin might be deleted or invalid token
      if (error.response && error.response.status === 404) {
        localStorage.removeItem("access_token"); // Clear token
      }
    }
  };

  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page;
            const Layout = route.isShowHeader ? DefaultComponent : Fragment;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
        <ChatbotComponent />
      </Router>
    </div>
  );
}

export default App;
