import { useEffect, useContext } from "react";

import { Favorite, Loader, Review } from "@/components";

const PROFILE_PICTURE = "https://pbs.twimg.com/media/Fvpd8chWcAEPllN.jpg";

import useGetSuggestions from "@/hooks/useGetSuggestions";
import useGetUserReviews from "@/hooks/useGetUserReviews";
import useDeleteReview from "@/hooks/useDeleteReview";

import { AuthContext } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const { deleteReview, state, error } = useDeleteReview();

  const handleDelete = (reviewId) => {
    deleteReview(reviewId);
  };

  const {
    state: suggestionsState,
    data: suggestionsData,
    error: suggestionsError,
    getSuggestions,
  } = useGetSuggestions();

  const {
    state: userReviewsState,
    data: userReviewsData,
    error: userReviewsError,
    getUserReviews,
  } = useGetUserReviews({
    value: user?.id || "",
  });

  useEffect(() => {
    getSuggestions();
  }, []);

  useEffect(() => {
    if (user?.id) {
      getUserReviews();
    }
  }, [user?.id]);

  console.log(userReviewsData);
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
            <img src={PROFILE_PICTURE} />
          </div>
        </div>

        <div className="profile__header__data">
          <h2>{user?.username ?? "-"}</h2>

          <div>
            <div>
              <span>99</span>
              <p>Juegos</p>
            </div>

            <div>
              <span>99</span>
              <p>Seguidores</p>
            </div>

            <div>
              <span>99</span>
              <p>Seguidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile__favorites">
        <h3>Favoritos</h3>

        {suggestionsState === "loading" && (
          <div className="profile__loading">
            <Loader />
          </div>
        )}

        {suggestionsError && (
          <div className="profile__error">
            <span>
              <i className="fa-solid fa-bug fa-xl"></i>
            </span>
            <p>Ups! Ha ocurrido un error!</p>
            <p>{suggestionsError.response.data.error}</p>
          </div>
        )}

        <div className="profile__favorites__list">
          {suggestionsState === "success" &&
            suggestionsData
              .slice(2)
              .map((suggestion) => (
                <Favorite
                  key={suggestion.id}
                  id={suggestion.id}
                  name={suggestion.name}
                  rating={suggestion.rating}
                  image={suggestion.background_image}
                />
              ))}
        </div>
      </div>

      <div className="profile__reviews">
        <h3>Reviews</h3>

        {userReviewsState === "loading" && (
          <div className="profile__loading">
            <Loader />
          </div>
        )}

        {userReviewsError && (
          <div className="profile__error">
            <span>
              <i className="fa-solid fa-bug fa-xl"></i>
            </span>
            <p>Ups! Ha ocurrido un error!</p>
            <p>{userReviewsError.response.data.error}</p>
          </div>
        )}

        <div className="profile__reviews__list">
          {userReviewsState === "success" &&
            userReviewsData.map((review) => (
              <Review
                key={review._id}
                imageUrl={review.imageUrl}
                gameName={review.gameName}
                content={review.content}
                rating={review.rating}
                onDelete={() => handleDelete(review._id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
