import axios from "axios";

const useUnfollowUser = () => {
  const unfollowUser = async (userId) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/users/unfollow/${userId}`);
  };

  return { unfollowUser };
};

export default useUnfollowUser;
