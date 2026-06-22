import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthApi from "../../api/auth.api";
import {
  getBanReasonForIdentifiers,
  getLatestBanReason,
} from "../../utils/adminLocalState";
import logo from "../../img/logo.svg";
import "./auth.css";
import "./auth-theme.css";

function getGoogleOAuthUrl() {
  return "http://localhost:8111/oauth2/authorization/google";
}

function decodeJwtPayload(token) {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showBanMessage = (reason) => {
    const message = `정지된 계정입니다. 사유: ${
      reason || "관리자에 의해 정지된 계정입니다."
    }`;
    setError(message);
    window.alert(message);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("아이디 또는 이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    const savedBanReason = getBanReasonForIdentifiers([identifier]);
    if (savedBanReason) {
      showBanMessage(savedBanReason);
      return;
      setError(`정지된 계정입니다. 사유: ${savedBanReason}`);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await AuthApi.login({
        identifier: identifier.trim(),
        password,
      });
      const result = res.data?.data || res.data;
      if (result?.accessToken) {
        const tokenPayload = decodeJwtPayload(result.accessToken);
        const resultStatus = String(result.status || "").toUpperCase();
        const isBannedResult =
          result.isBanned === true ||
          result.banned === true ||
          resultStatus === "BANNED" ||
          resultStatus === "SUSPENDED" ||
          resultStatus.includes("BAN");
        const resultBanReason = getBanReasonForIdentifiers([
          identifier,
          result.memberId,
          result.id,
          result.userId,
          result.email,
          result.nickname,
          result.username,
          result.userName,
          result.loginId,
          result.identifier,
          result.accountId,
          tokenPayload.sub,
          tokenPayload.email,
          tokenPayload.nickname,
          tokenPayload.username,
          tokenPayload.loginId,
          tokenPayload.memberId,
          tokenPayload.userId,
        ]);
        const resultServerReason =
          result.banReason || result.reason || result.suspendReason;
        if (isBannedResult || resultBanReason || resultServerReason) {
          const reason =
            resultServerReason ||
            resultBanReason ||
            getLatestBanReason() ||
            "관리자에 의해 정지된 계정입니다.";
          showBanMessage(reason);
          return;
          setError(`정지된 계정입니다. 사유: ${reason}`);
          return;
        }
        login({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          nickname: result.nickname || result.username || identifier,
          authority: result.role, // ← result.authority → result.role
        });
        navigate(result.role === "ROLE_ADMIN" ? "/admin" : "/", {
          // ← 여기도
          replace: true,
        });
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || "";
      const serverData = err.response?.data?.data || {};
      const reasonFromServer =
        serverData.banReason ||
        serverData.reason ||
        err.response?.data?.banReason ||
        err.response?.data?.reason;
      const reasonFromLocal = getBanReasonForIdentifiers([
        identifier,
        serverData.memberId,
        serverData.id,
        serverData.email,
        serverData.nickname,
        serverData.username,
        serverData.loginId,
      ]);
      const isBanError =
        serverMessage.includes("정지") ||
        serverMessage.includes("제재") ||
        serverMessage.toLowerCase().includes("ban") ||
        serverMessage.toLowerCase().includes("suspend");
      if (isBanError || reasonFromServer || reasonFromLocal) {
        const reason =
          reasonFromServer ||
          reasonFromLocal ||
          getLatestBanReason() ||
          "관리자에 의해 정지된 계정입니다.";
        showBanMessage(reason);
        return;
        setError(`정지된 계정입니다. 사유: ${reason}`);
        return;
      }
      if (getLatestBanReason()) {
        showBanMessage(getLatestBanReason());
        return;
      }
      setError(
        serverMessage ||
          "로그인에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleOAuthUrl();
  }

  return (
    <div className="auth-page">
      <img
        src={logo}
        alt="WONDEALER"
        className="auth-logo"
        style={{ height: 40, marginBottom: 32 }}
      />

      <div className="auth-card">
        <div className="signup-header">
          <h2>로그인</h2>
          <p>원딜러 계정으로 로그인하세요</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="find-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="identifier">
              아이디 또는 이메일
            </label>
            <input
              id="identifier"
              className="auth-input"
              type="text"
              autoComplete="username"
              placeholder="아이디 또는 이메일 주소"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              비밀번호
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  color: "#6a6e7a",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "처리 중..." : "로그인"}
          </button>
        </form>

        <div className="auth-divider">또는</div>

        <button
          type="button"
          className="auth-google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          Google로 로그인
        </button>

        <div className="signup-footer">
          <Link to="/find-id">아이디 찾기</Link>
          {" · "}
          <Link to="/reset-password">비밀번호 재설정</Link>
          {" · "}
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
