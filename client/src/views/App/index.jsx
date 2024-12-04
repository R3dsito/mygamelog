import { Routes, Route } from "react-router-dom";

import {
  GameDetails,
  Home,
  Login,
  Profile,
  Protected,
  Register,
} from "@/views";

import { Navbar } from "@/components";

import { AuthContextProvider } from "@/contexts/AuthContext";

const App = () => {
  return (
    <AuthContextProvider>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game-details" element={<GameDetails />} />

          <Route element={<Protected />}>
          <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </AuthContextProvider>
  );
};

export default App;
