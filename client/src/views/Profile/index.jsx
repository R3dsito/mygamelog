import { useEffect, useContext, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { Loader, Review } from "@/components";
import PlaylistCard from "@/components/PlaylistCard";
import PlaylistDetailModal from "@/components/PlaylistDetailModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import UserListModal from "@/components/UserListModal";
import api from "@/api/axiosInstance";
import useGetSuggestions from "@/hooks/useGetSuggestions";
import useGetUserReviews from "@/hooks/useGetUserReviews";
import useDeleteReview from "@/hooks/useDeleteReview";
import useGetUser from "@/hooks/useGetUser";
import { AuthContext } from "@/contexts/AuthContext";
import useGetUserByUsername from "@/hooks/useGetUserByUsername";
import useToggleFavorite from "@/hooks/useToggleFavorite";
import useGetFavorites from "@/hooks/useGetFavorites";
import useGetUserPlaylists from "@/hooks/useGetUserPlaylists";
import useManagePlaylists from "@/hooks/useManagePlaylists";
import { DEFAULT_AVATAR, DEFAULT_BANNER } from "@/constants/media";

const Profile = () => {
  const { user: loggedInUser, setUser } = useContext(AuthContext);
  const { id: userIdFromUrl, username: usernameFromUrl } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

const [showFollowersModal, setShowFollowersModal] = useState(false);
const [showFollowingModal, setShowFollowingModal] = useState(false);
const { state: favoritesState, data: favoritesData, error: favoritesError, getFavorites } = useGetFavorites();

const [showEditModal, setShowEditModal] = useState(false);

const { deleteReview } = useDeleteReview();



const { data: playlists, fetchPlaylists, setData: setPlaylists } = useGetUserPlaylists();
const { createPlaylist } = useManagePlaylists();
const [newPlaylistName, setNewPlaylistName] = useState("");
const [showNewPlaylist, setShowNewPlaylist] = useState(false);
const [selectedPlaylist, setSelectedPlaylist] = useState(null);


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
    fetchPlaylists(id);
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
        ? `/users/unfollow/${userIdFromUrl || userData?._id}`
        : `/users/follow/${userIdFromUrl || userData?._id}`;


    await api.post(endpoint, {});
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


const handleCreatePlaylist = async () => {
  if (!newPlaylistName.trim()) return;
  const res = await createPlaylist(newPlaylistName.trim());
  setPlaylists((prev) => [...prev, res.data]);
  setNewPlaylistName("");
  setShowNewPlaylist(false);
};

const handleProfileSaved = (newUsername) => {
  setShowEditModal(false);
  navigate(`/profile/username/${newUsername}`, { replace: true });
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

  const MIN_FAVORITES = 4;

  const favoritesToRender =
    favoritesState === "success" ? favoritesData : [];

  const emptySlots =
    favoritesToRender.length < MIN_FAVORITES
      ? MIN_FAVORITES - favoritesToRender.length
      : 0;


  if (userState === "loading") return <Loader />;
  if (userState === "error") return <p>Error al cargar el usuario: {userError?.message}</p>;

  return (
    <div className="profile">
      <div className="profile__header">
        <div
          className="profile__header__images"
          style={{
            backgroundImage: `url(${userData?.bannerImage || DEFAULT_BANNER})`,
          }}
        >
          <div>
              <img
      src={userData?.imagen || DEFAULT_AVATAR}
      alt="Profile"
    />

          </div>
        </div>

<div className="profile__header__data">
  <h1>{userData?.username ?? "-"}</h1>
  {userData?.bio && <p className="profile__bio">{userData.bio}</p>}

{isMyProfile && (
  <button onClick={() => setShowEditModal(true)}>
    Editar perfil
  </button>
)}

  <div>
    <div>
      <span>{userData?.favorites?.length ?? "0"}</span>
      <p>Favoritos</p>
    </div>

    <div className="profile__followers">
      <button type="button" className="profile__stat-btn" onClick={() => setShowFollowersModal(true)}>
        {userData?.followersCount ?? "0"}
      </button>
      <p>Seguidores</p>
    </div>


    <div className="profile__following">
      <button type="button" className="profile__stat-btn" onClick={() => setShowFollowingModal(true)}>{userData?.followingCount ?? "0"}</button>
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
  <h3>Favoritos</h3>

  {favoritesState === "loading" && <Loader />}

  {favoritesError && (
    <div className="profile__error">
      <p>Error al cargar favoritos.</p>
    </div>
  )}

  {favoritesState === "success" &&
    (favoritesToRender.length === 0 ? (
      <p className="profile__favorites__empty">No hay juegos favoritos aún.</p>
    ) : (
      <ul className="profile__favorites__grid">
        {favoritesToRender.map((fav) => (
          <li key={fav._id}>
            <Link
              to={`/game-details?id=${fav.gameId}`}
              className="profile__favorites__poster"
              title={fav.gameName}
            >
              <img src={fav.cover || fav.imageUrl} alt={fav.gameName} />
              <span className="profile__favorites__poster-name">{fav.gameName}</span>
            </Link>
          </li>
        ))}

        {/* Slots vacíos para mantener la grilla pareja hasta el mínimo. */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <li key={`empty-${i}`} className="profile__favorites__slot" aria-hidden="true" />
        ))}
      </ul>
    ))}
</div>

      <div className="profile__playlists">
        <div className="profile__playlists__header">
          <h3>Playlists</h3>
          {isMyProfile && (
            showNewPlaylist ? (
              <div className="profile__playlists__new">
                <input
                  type="text"
                  placeholder="Nombre de la playlist"
                  maxLength={50}
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                  autoFocus
                />
                <button onClick={() => setShowNewPlaylist(false)}>Cancelar</button>
                <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>Crear</button>
              </div>
            ) : (
              <button onClick={() => setShowNewPlaylist(true)}>
                <i className="fa-solid fa-plus" /> Nueva
              </button>
            )
          )}
        </div>
        {playlists.length === 0 ? (
          <p className="profile__playlists__empty">No hay playlists aún.</p>
        ) : (
          <div className="profile__playlists__list">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl._id}
                playlist={pl}
                isOwner={isMyProfile}
                onClick={() => setSelectedPlaylist(pl)}
                onDeleted={(id) => setPlaylists((prev) => prev.filter((p) => p._id !== id))}
                onUpdated={(updated) => setPlaylists((prev) => prev.map((p) => p._id === updated._id ? updated : p))}
              />
            ))}
          </div>
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
                postId={review._id}
                likes={review.likes || []}
                onDelete={
                  isMyProfile ? () => handleDelete(review._id) : undefined
                }
              />
            ))}
        </div>
      </div>
{selectedPlaylist && (
  <PlaylistDetailModal
    playlist={selectedPlaylist}
    onClose={() => setSelectedPlaylist(null)}
  />
)}

{showFollowersModal && (
  <UserListModal
    isOpen={showFollowersModal}
    setIsOpen={setShowFollowersModal}
    title="Seguidores"
    users={userData?.followers ?? []}
    emptyMessage="No tiene seguidores."
  />
)}

{showFollowingModal && (
  <UserListModal
    isOpen={showFollowingModal}
    setIsOpen={setShowFollowingModal}
    title="Seguidos"
    users={userData?.following ?? []}
    emptyMessage="No sigue a nadie."
  />
)}

<ProfileEditModal
  isOpen={showEditModal}
  setIsOpen={setShowEditModal}
  userData={userData}
  onSaved={handleProfileSaved}
/>


    </div>
    
    
  );
};

export default Profile;
