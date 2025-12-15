import { useState } from "react";
import axios from "axios";
import cookies from "js-cookie";


const useGetFollowers = ({ userId }) => {
  const [followersData, setFollowersData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getFollowers = async () => {
    setFollowersData({ state: "loading", data: null, error: null });

    try {
      const token = cookies.get("jwtToken");

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/followers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const data = response.data;

      setFollowersData({ state: "success", data, error: null });
    } catch (error) {
      setFollowersData({ state: "error", data: null, error });
    }
  };

  return {
    state: followersData.state,
    data: followersData.data,
    error: followersData.error,
    getFollowers,
  };
};

export default useGetFollowers;