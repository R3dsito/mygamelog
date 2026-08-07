import { Routes, Route } from "react-router-dom";

import {
  Feed,
  GameDetails,
  Home,
  Login,
  Profile,
  Protected,
  Register,
  ReviewDetail,
} from "@/views";

import { Navbar } from "@/components";

import { AuthContextProvider } from "@/contexts/AuthContext";

const App = () => {
  return (
    <AuthContextProvider>
      <div className="app">
        <a className="skip-link" href="#main-content">
          Saltar al contenido principal
        </a>

        <Navbar />

        <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game-details" element={<GameDetails />} />
          <Route path="/review/:postId" element={<ReviewDetail />} />

          <Route element={<Protected />}>
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile/username/:username" element={<Profile />} />
          </Route>
        </Routes>
        </main>
      </div>
    </AuthContextProvider>
  );
};

export default App;
