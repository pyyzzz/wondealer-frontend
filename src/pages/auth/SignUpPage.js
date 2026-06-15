// SignUpPage.jsx
import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthApi from "../../api/auth.api";
import logo from "../../img/logo.svg";
import "./auth.css";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
    nickname: "",
    phone: "",
    email: "",
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("이용약관 및 개인정보 처리방침에 동의해주세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
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

        <form onSubmit={handleSubmit} className="find-form">
          {error && <div className="auth-error">{error}</div>}

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

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="영문, 숫자, 특수문자 조합 8자 이상"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="auth-field">
            <label className="auth-label">이메일</label>
            <input
              className="auth-input"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

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
    </div>
  );
}
