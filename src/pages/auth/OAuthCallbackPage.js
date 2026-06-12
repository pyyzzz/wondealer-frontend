import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthApi from "../../api/auth.api";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await AuthApi.googleLogin(code);
        const { accessToken, refreshToken, nickname } = res.data;

        login({ accessToken, refreshToken, nickname });

        navigate("/", { replace: true });
      } catch (err) {
        console.error("OAuth callback failed:", err);
        navigate("/login?error=oauth_failed", { replace: true });
      }
    })();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-[var(--text-secondary)]">
        로그인 처리 중입니다...
      </div>
    </div>
  );
}
