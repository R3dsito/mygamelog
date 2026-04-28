import api from "@/api/axiosInstance";

const useUnfollowUser = () => {
  const unfollowUser = async (userId) => {
    await api.post(`/users/unfollow/${userId}`, {});
  };

  return { unfollowUser };
};

export default useUnfollowUser;
