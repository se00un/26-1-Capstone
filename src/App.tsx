import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TripDetailPage from "./pages/TripDetailPage";
import AddTripPage from "./pages/AddTripPage";
import AddSchedulePage from "./pages/AddSchedulePage";
import FriendsPage from "./pages/FriendsPage";
import BudgetPage from "./pages/BudgetPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const user = localStorage.getItem("user");

  return (
    <BrowserRouter>
      <Routes>

        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />

        {/* 메인 페이지 */}
        <Route
          path="/"
          element={user ? <MainPage /> : <Navigate to="/login" />}
        />

        {/* 아래도 전부 로그인 필요 */}
        <Route
          path="/trips/:tripId"
          element={user ? <TripDetailPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/trips/new"
          element={user ? <AddTripPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/trips/:tripId/schedule/new"
          element={user ? <AddSchedulePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/trips/:tripId/friends"
          element={user ? <FriendsPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/trips/:tripId/budget"
          element={user ? <BudgetPage /> : <Navigate to="/login" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;