import { useEffect } from "react";
import { Loader, Review } from "@/components";
import useGetFeed from "@/hooks/useGetFeed";
import "./styles.scss";

const Feed = () => {
  const { state, data, error, getFeed } = useGetFeed();

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="feed">
      <h2>Feed</h2>
      <p className="feed__subtitle">Las últimas reseñas de la comunidad</p>

      {state === "loading" && <Loader />}

      {state === "error" && (
        <div className="feed__error">
          <i className="fa-solid fa-bug fa-xl"></i>
          <p>Error al cargar el feed.</p>
        </div>
      )}

      <div className="feed__list">
        {state === "success" && data.length === 0 && (
          <p className="feed__empty">Aún no hay reseñas publicadas.</p>
        )}

        {state === "success" &&
          data.map((post) => (
            <Review
              key={post._id}
              username={post.userId?.username}
              imagen={post.userId?.imagen}
              gameId={post.gameId}
              gameName={post.gameName}
              imageUrl={post.imageUrl}
              content={post.content}
              rating={post.rating}
              postId={post._id}
              likes={post.likes || []}
            />
          ))}
      </div>
    </div>
  );
};

export default Feed;
