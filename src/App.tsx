import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TripDetailPage from "./pages/TripDetailPage";
import AddTripPage from "./pages/AddTripPage";
import AddSchedulePage from "./pages/AddSchedulePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trips/:tripId" element={<TripDetailPage />} />
        <Route path="/trips/new" element={<AddTripPage />} />
        <Route path="/trips/:tripId/schedule/new" element={<AddSchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;