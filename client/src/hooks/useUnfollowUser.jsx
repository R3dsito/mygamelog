import axios from "axios";

const useUnfollowUser = () => {
  const unfollowUser = async (userId) => {
    await axios.post(`http://localhost:3000/users/unfollow/${userId}`);
  };

  return { unfollowUser };
};

export default useUnfollowUser;
