import { useEffect, useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { Favorite, Loader, Review, Modal } from "@/components";
import axios from "axios";
import useGetSuggestions from "@/hooks/useGetSuggestions";
import useGetUserReviews from "@/hooks/useGetUserReviews";
import useDeleteReview from "@/hooks/useDeleteReview";
import useGetUser from "@/hooks/useGetUser";
import { AuthContext } from "@/contexts/AuthContext";
import useGetUserByUsername from "@/hooks/useGetUserByUsername";
import useToggleFavorite from "@/hooks/useToggleFavorite";
import useGetFavorites from "@/hooks/useGetFavorites";




const PROFILE_PICTURE = "https://pbs.twimg.com/media/Fvpd8chWcAEPllN.jpg";

const Profile = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const { id: userIdFromUrl, username: usernameFromUrl } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

const [showFollowersModal, setShowFollowersModal] = useState(false);
const [showFollowingModal, setShowFollowingModal] = useState(false);
const { state: favoritesState, data: favoritesData, error: favoritesError, getFavorites } = useGetFavorites();
console.log("favoritesData", favoritesData);
console.log("favoritesState", favoritesState);

  const { deleteReview } = useDeleteReview();


  const {
    state: userStateById,
    data: userDataById,
    error: userErrorById,
    getUser,
  } = useGetUser(userIdFromUrl);

  const {
    state: userStateByUsername,
    data: userDataByUsername,
    error: userErrorByUsername,
    getUserByUsername,
  } = useGetUserByUsername(usernameFromUrl);

  const {
    state: userReviewsState,
    data: userReviewsData,
    error: userReviewsError,
    getUserReviews,
  } = useGetUserReviews({
    value: userIdFromUrl || userDataByUsername?._id, // Usa el ID del usuario, ya sea desde la URL o desde los datos obtenidos por username
  });

  const {
    state: suggestionsState,
    data: suggestionsData,
    error: suggestionsError,
    getSuggestions,
  } = useGetSuggestions();


  const userData = userIdFromUrl ? userDataById : userDataByUsername;
  const userState = userIdFromUrl ? userStateById : userStateByUsername;
  const userError = userIdFromUrl ? userErrorById : userErrorByUsername;

  useEffect(() => {
  const id = userIdFromUrl || userDataByUsername?._id;
  if (id) {
    getFavorites(id);
  }
}, [userIdFromUrl, userDataByUsername]);


  useEffect(() => {
    if (userIdFromUrl) {
      getUser(userIdFromUrl); // Llama al hook para buscar por ID
      getUserReviews(); // Obtén las reviews basadas en el ID
    } else if (usernameFromUrl) {
      getUserByUsername(usernameFromUrl); // Llama al hook para buscar por username
    }
    getSuggestions();
  }, [userIdFromUrl, usernameFromUrl]);

  useEffect(() => {
    if (userDataByUsername?._id && !userIdFromUrl) {
      getUserReviews(); // Obtén las reviews basadas en el ID obtenido por username
    }
  }, [userDataByUsername]);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing
        ? `${import.meta.env.VITE_API_URL}/users/unfollow/${userIdFromUrl || userData?._id}`
        : `${import.meta.env.VITE_API_URL}/users/follow/${userIdFromUrl || userData?._id}`;


    await axios.post(endpoint, { userId: loggedInUser?.id });
    setIsFollowing(!isFollowing);

    if (userIdFromUrl) {
      getUser(userIdFromUrl);
    } else if (usernameFromUrl) {
      getUserByUsername(usernameFromUrl);
    }

  } catch (error) {
    console.error("Error al seguir/dejar de seguir:", error);
  }
};

const handleDelete = async (reviewId) => {
  await deleteReview(reviewId);
  getUserReviews(); // Vuelve a obtener las reviews actualizadas
};
const { toggleFavorite } = useToggleFavorite();

const handleToggleFavorite = async (postId) => {
  const updatedUser = await toggleFavorite({
    userId: loggedInUser?.id,
    postId,
  });
  if (updatedUser) {
    if (userIdFromUrl) getUser(userIdFromUrl);
    else if (usernameFromUrl) getUserByUsername(usernameFromUrl);
  }
};

const handleImageUpload = async (e) => {
  const formData = new FormData();
  formData.append("profileImage", e.target.files[0]);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/users/upload-profile-image/${loggedInUser.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log("Imagen subida:", res.data.imageUrl);
  } catch (err) {
    console.error("Error al subir imagen:", err);
  }
};





  const isMyProfile = loggedInUser?.id === (userIdFromUrl || userData?._id);
  
  useEffect(() => {
  if (userData && loggedInUser) {
    const isUserFollowing = userData.followers?.some(
      (follower) => follower._id === loggedInUser.id
    );
    setIsFollowing(isUserFollowing);
  }
}, [userData, loggedInUser]);

  if (userState === "loading") return <Loader />;
  if (userState === "error") return <p>Error al cargar el usuario: {userError?.message}</p>;

  return (
    <div className="profile">
      <div className="profile__header">
        <div
          className="profile__header__images"
          style={{
            backgroundImage: `url(https://image.tensorartassets.com/cdn-cgi/image/anim=true,plain=false,w=2048,f=jpeg,q=85/posts/images/646889879699062307/8f152d51-dd42-404f-898d-8a1c38f12a6b.jpg)`,
          }}
        >
          <div>
              <img
      src={userData?.imagen || PROFILE_PICTURE}
      alt="Profile"
    />

          </div>
        </div>

<div className="profile__header__data">
  <h2>{userData?.username ?? "-"}</h2>
  
<input type="file" onChange={handleImageUpload} />

  <div>
    <div>
      <span>{userData?.favorites?.length ?? "0"}</span>
      <p>Juegos</p>
    </div>

    <div className="profile__followers">
      <span onClick={() => setShowFollowersModal(true)}>
        {userData?.followersCount ?? "0"}
      </span>
      <p>Seguidores</p>
    </div>


    <div className="profile__following">
      <span onClick={() => setShowFollowingModal(true)}>{userData?.followingCount ?? "0"}</span>
      <p>Seguidos</p>
    </div>
  </div>
{!isMyProfile && (
  <button onClick={handleFollowToggle}>
    <i className={`fa-solid ${isFollowing ? "fa-user-minus" : "fa-user-plus"}`}></i>
    {isFollowing ? " Dejar de seguir" : " Seguir"}
  </button>
)}
</div>

      </div>

<div className="profile__favorites">
  {favoritesState === "loading" && <Loader />}
  {favoritesError && (
    <div className="profile__error">
      <p>Error al cargar favoritos.</p>
    </div>
  )}
  {favoritesState === "success" && favoritesData.length > 0 ? (
    favoritesData.map((favorites) => (
      <Favorite
        key={favorites._id}
        id={favorites.gameId}
        name={favorites.gameName}
        rating={favorites.rating}
        image={favorites.imageUrl}
      />
    ))
  ) : (
    <p>No hay juegos favoritos aún.</p>
  )}
</div>


      <div className="profile__reviews">
        <h3>Reviews</h3>
        {userReviewsState === "loading" && <Loader />}
        {userReviewsError && (
          <div className="profile__error">
            <p>Ups! Ha ocurrido un error!</p>
            <p>{userReviewsError.response?.data?.error}</p>
          </div>
        )}
        <div className="profile__reviews__list">
          {userReviewsState === "success" &&
            userReviewsData.map((review) => (
              <Review
                key={review._id}
                gameId={review.gameId}
                imageUrl={review.imageUrl}
                gameName={review.gameName}
                content={review.content}
                rating={review.rating}
                
                onDelete={
                  isMyProfile ? () => handleDelete(review._id) : undefined
                }
              />
            ))}
        </div>
      </div>
{showFollowersModal && (
  <Modal
    isOpen={showFollowersModal}
    setIsOpen={setShowFollowersModal}
    title="Seguidores"
  >
    {userData?.followers?.length > 0 ? (
      <ul>
        {userData.followers.map((user) => (
          <Link to={`/profile/username/${user.username}`} onClick={() => setIsOpen(false)}>
          <li className="modal__followers" key={user._id}><div>
            <img
  src={user.imagen || PROFILE_PICTURE}
  alt="Profile"
/>
          </div>{user.username}</li>
          </Link>
        ))}
      </ul>
    ) : (
      <p>No tiene seguidores.</p>
    )}
  </Modal>
)}

{showFollowingModal && (
  <Modal
    isOpen={showFollowingModal}
    setIsOpen={setShowFollowingModal}
    title="Seguidos"
  >
    {userData?.following?.length > 0 ? (
      <ul>
        {userData.following.map((user) => (
          <Link to={`/profile/username/${user.username}`} onClick={() => setIsOpen(false)}>
  <li className="modal__followers" key={user._id}><div>
            <img
  src={user.imagen || PROFILE_PICTURE}
  alt="Profile"
/>
          </div>{user.username}</li>
</Link>
        ))}
      </ul>
    ) : (
      <p>No sigue a nadie.</p>
    )}
  </Modal>
)}

    </div>
    
    
  );
};

export default Profile;
