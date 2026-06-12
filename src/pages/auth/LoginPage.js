import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthApi from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + "/oauth2/callback/google")}&response_type=code&scope=email%20profile`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value })),
    [],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await AuthApi.login(form.identifier, form.password);
      const data = res.data?.data || res.data;
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        nickname: data.nickname || data.username,
        role: data.role,
      });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">WONDEALER</div>
        <div className="auth-title">로그인</div>
        <div className="auth-hint"></div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label className="auth-label">아이디 또는 이메일</label>
            <input
              className="auth-input"
              name="identifier"
              placeholder="아이디 또는 이메일"
              value={form.identifier}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {/* 아이디/비밀번호 찾기 영역 고정 링크 */}
          <div className="auth-find-links">
            <Link to="/find-id">아이디 찾기</Link>
            <span className="auth-find-divider">|</span>
            <Link to="/find-password">비밀번호 찾기</Link>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <button
          className="auth-google"
          onClick={handleGoogleLogin}
          type="button"
        >
          <GoogleIcon />
          Google 계정으로 로그인
        </button>

        <div className="auth-footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      style={{ marginRight: "8px" }}
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.72H.95v2.3A8.992 8.992 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.68A5.405 5.405 0 0 1 3.64 9c0-.58.1-1.15.28-1.68V5.02H.95A8.992 8.992 0 0 0 0 9c0 1.45.35 2.82.95 4.03l3-2.35z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3C13.46.86 11.43 0 9 0 5.48 0 2.44 2.02.95 5.02l3 2.35c.71-2.14 2.7-3.72 5.05-3.72z"
      />
    </svg>
  );
}
