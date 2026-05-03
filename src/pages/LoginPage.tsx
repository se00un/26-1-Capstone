import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
// import { googleLogin } from "../api/authApi"; 

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const decoded: any = jwtDecode(credentialResponse.credential);

    // 사용자 정보 저장
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      })
    );

    // 메인 페이지 이동
    window.location.href = "/";
  };

  return (
    <div className="app-container">
      <div style={{ padding: "60px 30px", textAlign: "center" }}>
        <h1 style={{ color: "#2563eb", marginBottom: "40px" }}>
          TripLog
        </h1>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
  );
}