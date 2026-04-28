import api from "@/api/axiosInstance";

const useFollowUser = () => {
  const followUser = async (userId) => {
    await api.post(`/users/follow/${userId}`, {});
  };

  return { followUser };
};

export default useFollowUser;
