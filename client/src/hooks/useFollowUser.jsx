import axios from "axios";

const useFollowUser = () => {
  const followUser = async (userId) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/users/follow/${userId}`);
  };

  return { followUser };
};

export default useFollowUser;
