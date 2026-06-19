import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthApi from "../../api/auth.api";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const isProcessing = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // ✅ 중복 호출 완전 차단
    if (isProcessing.current) return;
    isProcessing.current = true;

    (async () => {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        const res = await AuthApi.googleLoginWithCode(code);
        const result = res.data?.data || res.data;

        console.log("구글 응답:", JSON.stringify(result));
        console.log("백엔드 응답 전체:", JSON.stringify(result, null, 2));

        if (result && result.accessToken) {
          // ✅ 구글 닉네임 우선, 없으면 이메일 앞부분, 그것도 없으면 기본값
          const googleNickname =
            result.nickname ||
            result.name ||
            (result.email ? result.email.split("@")[0] : "") ||
            result.username ||
            "구글 사용자";

          login({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken ?? null,
            nickname: googleNickname,
            email: result.email ?? null,
            authority: result.authority ?? null,
          });

          navigate("/", { replace: true });
        } else {
          throw new Error("응답 데이터에 AccessToken이 누락되었습니다.");
        }
      } catch (err) {
        console.error("구글 인증 실패:", err);

        // ✅ 락 해제 — 재시도 가능하게
        isProcessing.current = false;

        const status = err.response?.status || "Network Error/CORS";
        const serverMessage =
          err.response?.data?.message ||
          err.message ||
          "서버와 통신할 수 없습니다.";

        setErrorMsg(`인증 실패 (${status}): ${serverMessage}`);
      }
    })();
  }, []); // ✅ 의존성 배열 비움 — 마운트 1회만 실행

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
