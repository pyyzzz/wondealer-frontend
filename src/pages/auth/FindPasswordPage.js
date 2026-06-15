import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Common from "../../utils/Common";
import logoSvg from "../../img/logo.svg";
import "./auth.css";

const api = axios.create({ baseURL: Common.API_URL });

export default function FindPasswordPage() {
  const [form, setForm] = useState({ username: "", email: "", code: "" });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // [API] 이메일 인증번호 발송
  const handleSendCode = async () => {
    if (!form.email) {
      setMessage({ type: "error", text: "이메일을 입력해주세요." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/email/send", {
        email: form.email,
      });
      if (response.status === 200) {
        setIsCodeSent(true);
        setMessage({ type: "success", text: "인증번호가 발송되었습니다." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "서버 통신 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  // [API] 인증번호 개별 검증
  const handleVerifyCode = async () => {
    if (!form.code) {
      setMessage({ type: "error", text: "인증번호를 입력해주세요." });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/email/verify", {
        email: form.email,
        code: form.code,
      });
      if (response.status === 200) {
        setIsVerified(true);
        setMessage({
          type: "success",
          text: "인증 성공! 임시 비밀번호를 발급하세요.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "인증번호가 유효하지 않습니다." });
    } finally {
      setLoading(false);
    }
  };

  // [API] 아이디 + 이메일 검증 후 임시 비밀번호 메일 발송
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/reset-password", {
        username: form.username,
        email: form.email,
      });
      if (response.status === 200) {
        setMessage({
          type: "success",
          text: "이메일로 임시 비밀번호가 발송되었습니다.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "일치하는 회원 정보를 찾을 수 없습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* 가로 폭 최대 제한 및 유연한 100% 레이아웃 대응 */}
      <div className="auth-card" style={{ width: "100%", maxWidth: "420px" }}>
        {/* 상단 통합 로고 배치 */}
        <div className="auth-logo">
          <Link to="/">
            <img
              src={logoSvg}
              alt="WONDEALER"
              style={{
                width: "100%",
                maxWidth: "160px",
                height: "auto",
                display: "block",
                margin: "0 auto",
              }}
            />
          </Link>
        </div>

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
              disabled={isVerified}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">이메일 주소</label>
            {/* 입력 폼 반응형 유연성 유지용 스타일 링 */}
            <div
              className="email-input-group"
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                className="auth-input"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                disabled={isVerified}
                required
                style={{ flex: 1, minWidth: "0" }}
              />
              <button
                type="button"
                className="btn-send-code"
                onClick={handleSendCode}
                disabled={loading || isVerified}
                style={{
                  whiteSpace: "nowrap",
                  padding: "0 14px",
                  flexShrink: 0,
                }}
              >
                {isCodeSent ? "재발송" : "인증 요청"}
              </button>
            </div>
          </div>

          {isCodeSent && (
            <div className="auth-field">
              <label className="auth-label">인증번호</label>
              <div
                className="email-input-group"
                style={{ display: "flex", gap: "8px" }}
              >
                <input
                  className="auth-input"
                  name="code"
                  placeholder="인증번호 6자리 입력"
                  value={form.code}
                  onChange={handleChange}
                  disabled={isVerified}
                  required
                  style={{ flex: 1, minWidth: "0" }}
                />
                <button
                  type="button"
                  className="btn-send-code"
                  onClick={handleVerifyCode}
                  disabled={loading || isVerified}
                  style={{
                    whiteSpace: "nowrap",
                    padding: "0 14px",
                    flexShrink: 0,
                  }}
                >
                  {isVerified ? "완료" : "확인"}
                </button>
              </div>
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
