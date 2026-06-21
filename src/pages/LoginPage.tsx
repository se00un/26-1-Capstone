import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../api/authAPI";
import "./LoginPage.css";

export default function LoginPage() {
  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    try {
      const data = await googleLogin(credentialResponse.credential);

      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.nickname,
          email: data.user.email,
          picture: data.user.profile_image_url,
        })
      );

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("로그인 실패");
    }
  };

  return (
    <div className="app-container">
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-logo">TripLog</h1>

          <p className="login-subtitle">
            여행 기록과 예산을 한 번에 관리하세요
          </p>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login Failed")}
              width="300"
              size="large"
              shape="pill"
              text="signin_with"
            />
          </div>
        </div>
      </div>
    </div>
  );
}