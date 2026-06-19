import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";
import logo from "../../img/logo.svg";
import "./auth.css";
import "./auth-theme.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 최초 로드 시 localStorage에 백업된 데이터가 있다면 불러옵니다. (탭 간 데이터 유지)
  const [form, setForm] = useState(() => {
    const savedForm = localStorage.getItem("signup_form_backUp");
    return savedForm
      ? JSON.parse(savedForm)
      : {
          username: "",
          password: "",
          passwordConfirm: "",
          name: "",
          nickname: "",
          phone: "",
          email: "",
        };
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  // 실시간으로 localStorage에 데이터 백업
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const updated = { ...f, [name]: value };
      localStorage.setItem("signup_form_backUp", JSON.stringify(updated));
      return updated;
    });

    if (name === "email") {
      setEmailSent(false);
      setEmailVerified(false);
      setEmailMsg("");
    }
  }, []);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const email = searchParams.get("email");

    if (verified === "true") {
      setEmailVerified(true);
      setEmailSent(true);
      setEmailMsg("✓ 인증이 완료되었습니다.");

      if (email) {
        const decodedEmail = decodeURIComponent(email);
        setForm((f) => {
          const updated = { ...f, email: decodedEmail };
          localStorage.setItem("signup_form_backUp", JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [searchParams]);

  const handleSendEmail = async () => {
    if (!form.email) {
      setEmailMsg("이메일을 먼저 입력해주세요.");
      return;
    }
    setEmailSending(true);
    setEmailMsg("");
    try {
      await AuthApi.sendVerifyEmail(form.email);
      setEmailSent(true);
      setEmailMsg("인증 메일을 발송했습니다. 메일함을 확인해주세요.");
    } catch (err) {
      setEmailMsg(err.response?.data?.message || "메일 발송에 실패했습니다.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!emailVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }
    if (!agreeTerms) {
      setError("이용약관 및 개인정보 처리방침에 동의해주세요.");
      return;
    }

    setLoading(true);
    try {
      await AuthApi.signup({
        username: form.username,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
        email: form.email,
        termsAgreed: [1, 2],
      });

      // 가입 성공 시 백업 데이터 완벽 청소
      localStorage.removeItem("signup_form_backUp");

      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <img
        src={logo}
        alt="WONDEALER"
        style={{ height: 40, marginBottom: 32 }}
      />

      <div className="auth-card">
        <div className="signup-header">
          <h2>회원가입</h2>
          <p>새로운 거래의 시작을 함께하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {/* 이메일 */}
          <div className="auth-field">
            <label className="auth-label">
              이메일
              {emailVerified && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  ✓ 인증 완료
                </span>
              )}
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="auth-input"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                disabled={emailVerified}
                required
                style={{
                  flex: 1,
                  ...(emailVerified && {
                    borderColor: "#4ade80",
                    color: "#4ade80",
                  }),
                }}
              />
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailSending || emailVerified}
                style={{
                  flexShrink: 0,
                  padding: "0 14px",
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: emailVerified ? "default" : "pointer",
                  whiteSpace: "nowrap",
                  background: emailVerified ? "#1a3a1a" : "#374151",
                  color: emailVerified ? "#4ade80" : "#fff",
                  transition: "background 0.2s",
                }}
              >
                {emailVerified
                  ? "✓ 인증완료"
                  : emailSending
                    ? "발송 중..."
                    : emailSent
                      ? "재발송"
                      : "인증 메일 발송"}
              </button>
            </div>
            {emailMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 6,
                }}
              >
                {emailSent && !emailVerified && (
                  <svg
                    style={{
                      animation: "spin 1s linear infinite",
                      flexShrink: 0,
                    }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#b2b9ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                )}
                <p
                  style={{
                    fontSize: 12,
                    margin: 0,
                    color: emailVerified
                      ? "#4ade80"
                      : emailSent
                        ? "#b2b9ff"
                        : "#fca5a5",
                  }}
                >
                  {emailMsg}
                </p>
              </div>
            )}
          </div>

          {/* 아이디 */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <input
              className="auth-input"
              name="username"
              placeholder="아이디를 입력하세요"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="auth-field">
            <label className="auth-label">비밀번호 확인</label>
            <input
              className="auth-input"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 한번 더 입력하세요"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>

          {/* 이름 */}
          <div className="auth-field">
            <label className="auth-label">이름</label>
            <input
              className="auth-input"
              name="name"
              placeholder="이름을 입력하세요"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* 닉네임 + 휴대폰 */}
          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">닉네임</label>
              <input
                className="auth-input"
                name="nickname"
                placeholder="사용할 닉네임"
                value={form.nickname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">휴대폰 번호</label>
              <input
                className="auth-input"
                name="phone"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="auth-checkbox-group">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="agreeTerms">
              모든 이용약관 및 개인정보 처리방침에 동의합니다.
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "처리 중..." : "가입하기"}
          </button>
        </form>

        <div className="signup-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
