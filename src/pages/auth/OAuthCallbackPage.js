import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthApi from "../../api/auth.api";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // 💡 useRef를 활용한 완벽한 중복 호출 차단 락(Lock) 메커니즘
  const isProcessing = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // React 18 StrictMode 또는 중복 렌더링으로 인한 두 번 호출 차단
    if (isProcessing.current) return;
    isProcessing.current = true;

    (async () => {
      try {
        // 인증 전 스토리지 정리
        localStorage.clear();

        // 1. 백엔드로 구글 인가 코드 전달
        const res = await AuthApi.googleLoginWithCode(code);
        const result = res.data?.data || res.data;

        // 2. 로그인 성공 처리
        if (result && result.accessToken) {
          login({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            nickname: result.nickname || result.username || "구글 사용자",
          });
          navigate("/", { replace: true });
        } else {
          throw new Error("응답 데이터에 AccessToken이 누락되었습니다.");
        }
      } catch (err) {
        console.error("🔴 구글 인증 최종 디버깅:", err);

        const status = err.response?.status || "Network Error/CORS";

        // 💡 고정된 메시지 대신 '실제 백엔드가 준 에러 메시지'를 동적으로 바인딩
        const serverMessage =
          err.response?.data?.message ||
          err.message ||
          "서버와 통신할 수 없습니다.";

        setErrorMsg(`인증 실패 (${status}): ${serverMessage}`);
      }
    })();
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div
          className="auth-logo"
          style={{ fontSize: "24px", fontWeight: "bold", color: "#6c63ff" }}
        >
          WONDEALER
        </div>
        <div style={{ marginTop: "20px", fontSize: "14px" }}>
          {errorMsg ? (
            <div style={{ color: "#fca5a5" }}>
              <p style={{ margin: "0 0 16px", lineHeight: "1.5" }}>
                {errorMsg}
              </p>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#6c63ff,#3b82f6)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <div style={{ color: "#9ca3af" }}>
              <span className="animate-pulse">
                🔒 구글 보안 인증을 완료하는 중입니다...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
