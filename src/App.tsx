import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TripDetailPage from "./pages/TripDetailPage";
import AddTripPage from "./pages/AddTripPage";
import AddSchedulePage from "./pages/AddSchedulePage";
import FriendsPage from "./pages/FriendsPage";
import BudgetPage from "./pages/BudgetPage";
// import BudgetSettingPage from "./pages/BudgetSettingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trips/:tripId" element={<TripDetailPage />} />
        <Route path="/trips/new" element={<AddTripPage />} />
        <Route path="/trips/:tripId/schedule/new" element={<AddSchedulePage />} />
        <Route path="/trips/:tripId/friends" element={<FriendsPage />} />
        <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
        {/* <Route path="/trips/:tripId/budget/setting" element={<BudgetSettingPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;