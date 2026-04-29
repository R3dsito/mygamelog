import { useEffect, useContext, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { Favorite, Loader, Review, Modal } from "@/components";
import PlaylistCard from "@/components/PlaylistCard";
import PlaylistDetailModal from "@/components/PlaylistDetailModal";
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




const PROFILE_PICTURE = "https://pbs.twimg.com/media/Fvpd8chWcAEPllN.jpg";

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

const [editData, setEditData] = useState({ name: "", username: "", email: "", bio: "" });
const [previewAvatar, setPreviewAvatar] = useState(null);
const [previewBanner, setPreviewBanner] = useState(null);

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

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPreviewAvatar(URL.createObjectURL(file));
  const formData = new FormData();
  formData.append("profileImage", file);
  try {
    await api.post(`/users/upload-profile-image/${loggedInUser.id}`, formData);
  } catch (err) {
    console.error("Error al subir avatar:", err);
    setPreviewAvatar(null);
  }
};

const handleBannerUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPreviewBanner(URL.createObjectURL(file));
  const formData = new FormData();
  formData.append("bannerImage", file);
  try {
    await api.post(`/users/upload-banner-image/${loggedInUser.id}`, formData);
  } catch (err) {
    console.error("Error al subir banner:", err);
    setPreviewBanner(null);
  }
};

const handleCreatePlaylist = async () => {
  if (!newPlaylistName.trim()) return;
  const res = await createPlaylist(newPlaylistName.trim());
  setPlaylists((prev) => [...prev, res.data]);
  setNewPlaylistName("");
  setShowNewPlaylist(false);
};

const handleUpdateProfile = async () => {
  try {
    await api.put(`/users/update/${loggedInUser.id}`, editData);
    setShowEditModal(false);
    setPreviewAvatar(null);
    setPreviewBanner(null);
    setUser((prev) => ({ ...prev, name: editData.name, username: editData.username }));
    // Navegar a la nueva URL para que el componente se remonte con el username correcto
    navigate(`/profile/username/${editData.username}`, { replace: true });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
  }
};





  useEffect(() => {
    if (showEditModal && userData) {
      setEditData({
        name: userData.name || "",
        username: userData.username || "",
        email: userData.email || "",
        bio: userData.bio || "",
      });
    }
  }, [showEditModal]);

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
            backgroundImage: `url(${userData?.bannerImage || "https://image.tensorartassets.com/cdn-cgi/image/anim=true,plain=false,w=2048,f=jpeg,q=85/posts/images/646889879699062307/8f152d51-dd42-404f-898d-8a1c38f12a6b.jpg"})`,
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
  {userData?.bio && <p className="profile__bio">{userData.bio}</p>}

{isMyProfile && (
  <button onClick={() => setShowEditModal(true)}>
    Editar perfil
  </button>
)}

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

  {favoritesState === "success" && (
    <>
      {favoritesToRender.map((fav) => (
        <Favorite
          key={fav._id}
          id={fav.gameId}
          name={fav.gameName}
          rating={fav.rating}
          image={fav.imageUrl}
        />
      ))}

      {/* Slots vacíos */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div key={`empty-${i}`} className="favorite favorite--empty">
          <span>+</span>
        </div>
      ))}
    </>
  )}

</div>
  {favoritesState === "success" && favoritesToRender.length === 0 && (
    <p className="profile_nofavorites">No hay juegos favoritos aún.</p>
  )}

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
            <img className="userImage"
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
            <img className="userImage"
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

{showEditModal && (
  <Modal
    isOpen={showEditModal}
    setIsOpen={setShowEditModal}
    title="Editar perfil"
  >
    <form
      onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}
      className="edit-profile"
    >
      {/* Banner */}
      <div className="edit-profile__banner">
        <img
          src={previewBanner || userData?.bannerImage || "https://image.tensorartassets.com/cdn-cgi/image/anim=true,plain=false,w=2048,f=jpeg,q=85/posts/images/646889879699062307/8f152d51-dd42-404f-898d-8a1c38f12a6b.jpg"}
          alt="Banner"
        />
        <label className="edit-profile__overlay">
          <i className="fa-solid fa-camera"></i>
          <input type="file" accept="image/*" hidden onChange={handleBannerUpload} />
        </label>
      </div>

      {/* Avatar */}
      <div className="edit-profile__avatar">
        <img src={previewAvatar || userData?.imagen || PROFILE_PICTURE} alt="Avatar" />
        <label className="edit-profile__overlay edit-profile__overlay--small">
          <i className="fa-solid fa-camera"></i>
          <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
        </label>
      </div>

      {/* Campos */}
      <div className="edit-profile__fields">
        <div className="edit-profile__field">
          <label>Nombre</label>
          <input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            maxLength={50}
          />
        </div>
        <div className="edit-profile__field">
          <label>Usuario</label>
          <input
            value={editData.username}
            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            maxLength={30}
          />
        </div>
        <div className="edit-profile__field">
          <label>Bio <span className="edit-profile__char-count">{editData.bio.length}/160</span></label>
          <textarea
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            maxLength={160}
            rows={3}
            placeholder="Contá algo sobre vos..."
          />
        </div>
      </div>

      <button type="submit" className="edit-profile__save">Guardar cambios</button>
    </form>
  </Modal>
)}


    </div>
    
    
  );
};

export default Profile;
