import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // React 18 StrictMode로 인해 토큰 저장 및 로그인 로직이 두 번 실행되는 것을 방지하는 락(Lock)
  const isProcessing = useRef(false);

  useEffect(() => {
    // URL 쿼리 스트링에서 백엔드가 보낸 token과 관련 정보들을 가져옵니다.
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const nickname =
      searchParams.get("nickname") ||
      searchParams.get("username") ||
      "구글 사용자";

    if (token) {
      // 중복 실행 차단
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        // 기존 스토리지 정리
        localStorage.clear();

        // ⭐️ 백엔드에서 받은 토큰을 로컬스토리지에 저장
        localStorage.setItem("accessToken", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // 전역 AuthContext 로그인 상태 업데이트
        if (login) {
          login({
            accessToken: token,
            refreshToken: refreshToken || "",
            nickname: nickname,
          });
        }

        // 메인 페이지로 이동 (뒤로가기 방지를 위해 replace: true 설정)
        navigate("/", { replace: true });
      } catch (error) {
        console.error("로그인 처리 중 오류 발생:", error);
        navigate("/login");
      }
    } else {
      // 주소창에 토큰이 없으면 로그인 페이지로 튕겨내기
      navigate("/login");
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-page">
      <div
        className="auth-card"
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--color-primary)",
            marginBottom: "20px",
          }}
        >
          WONDEALER
        </div>
        <div style={{ color: "var(--text-secondary", fontSize: "14px" }}>
          <span className="animate-pulse">
            🔒 구글 보안 인증을 완료하는 중입니다...
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginSuccessPage;
