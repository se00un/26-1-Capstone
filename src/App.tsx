import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TripDetailPage from "./pages/TripDetailPage";
import AddTripPage from "./pages/AddTripPage";
import AddSchedulePage from "./pages/AddSchedulePage";
import FriendsPage from "./pages/FriendsPage";
import BudgetPage from "./pages/BudgetPage";
import BudgetManagePage from "./pages/BudgetManagePage";
import AddExpensePage from "./pages/AddExpensePage";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import ReceiptPage from "./pages/ReceiptPage";
import SettlementPage from "./pages/SettlementPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

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

        {/* 예산 관리 (카테고리별 예산 설정 + 도넛 요약) */}
        <Route
          path="/trips/:tripId/budget/manage"
          element={user ? <BudgetManagePage /> : <Navigate to="/login" />}
        />

        {/* 지출 추가 */}
        <Route
          path="/trips/:tripId/budget/expense/new"
          element={user ? <AddExpensePage /> : <Navigate to="/login" />}
        />

        {/* 지출 세부보기 (수정/삭제) */}
        <Route
          path="/trips/:tripId/budget/expense/:expenseId"
          element={user ? <ExpenseDetailPage /> : <Navigate to="/login" />}
        />

        {/* 영수증 인식 (틀) */}
        <Route
          path="/trips/:tripId/budget/receipt"
          element={user ? <ReceiptPage /> : <Navigate to="/login" />}
        />

        {/* 정산 (틀) */}
        <Route
          path="/trips/:tripId/settle"
          element={user ? <SettlementPage /> : <Navigate to="/login" />}
        />

        {/* 내 정보 페이지 */}
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;