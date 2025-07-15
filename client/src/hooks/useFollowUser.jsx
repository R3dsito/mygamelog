import axios from "axios";

const useFollowUser = () => {
  const followUser = async (userId) => {
    await axios.post(`http://localhost:3000/users/follow/${userId}`);
  };

  return { followUser };
};

export default useFollowUser;
