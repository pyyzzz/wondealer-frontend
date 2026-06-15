import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";

export default function FindPasswordPage() {
  const [form, setForm] = useState({ username: "", email: "", code: "" });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendCode = async () => {
    if (!form.email) {
      setMessage({ type: "error", text: "이메일을 입력해주세요." });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (response.ok) {
        setIsCodeSent(true);
        setMessage({ type: "success", text: "인증번호가 발송되었습니다." });
      } else {
        setMessage({ type: "error", text: "메일 발송에 실패했습니다." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "서버 통신 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email }),
      });
      if (response.ok) {
        setMessage({
          type: "success",
          text: "이메일로 임시 비밀번호가 발송되었습니다.",
        });
      } else {
        setMessage({
          type: "error",
          text: "일치하는 회원 정보를 찾을 수 없습니다.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "요청 처리 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">WONDEALER</div>

        <div className="find-header">
          <h2>비밀번호 찾기</h2>
          <p>가입 시 등록한 정보로 임시 비밀번호를 발급받을 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="find-form">
          {message.text && (
            <div className={`auth-message ${message.type}`}>{message.text}</div>
          )}

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
            <label className="auth-label">이메일 주소</label>
            <div className="email-input-group">
              <input
                className="auth-input"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn-send-code"
                onClick={handleSendCode}
                disabled={loading}
              >
                인증번호 발송
              </button>
            </div>
          </div>

          {isCodeSent && (
            <div className="auth-field">
              <label className="auth-label">인증번호</label>
              <input
                className="auth-input"
                name="code"
                placeholder="인증번호 6자리 입력"
                value={form.code}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "발송 중..." : "비밀번호 찾기"}
          </button>
        </form>

        <div className="find-footer">
          <Link to="/login" className="back-to-login">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
