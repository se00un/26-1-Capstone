import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../api/authAPI";

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
      <div style={{ padding: "60px 30px", textAlign: "center" }}>
        <h1 style={{ color: "#2563eb", marginBottom: "40px" }}>TripLog</h1>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
  );
}