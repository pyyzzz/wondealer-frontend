import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Common from "../../utils/Common";
import logoSvg from "../../img/logo.svg";
import "./auth.css";

const api = axios.create({ baseURL: Common.API_URL });

export default function FindIdPage() {
  const [form, setForm] = useState({ name: "", email: "", code: "" });
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
        setMessage({ type: "success", text: "이메일 인증이 완료되었습니다." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "인증번호가 일치하지 않습니다." });
    } finally {
      setLoading(false);
    }
  };

  // [API] 성함 + 이메일 최종 아이디 조회
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 인증 완료가 되지 않았을 때 제출 제한 추가
    if (!isVerified) {
      setMessage({ type: "error", text: "이메일 인증을 먼저 완료해주세요." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/find-username", {
        name: form.name,
        email: form.email,
      });
      const result = response.data;
      const userId = result?.data || result?.username || result;

      if (response.status === 200 && userId) {
        setMessage({
          type: "success",
          text: `고객님의 아이디는 [ ${userId} ] 입니다.`,
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
      {/* 반응형 레이아웃: 모바일 패딩 축소 및 너비 유연화 적용 필요 (auth.css) */}
      <div className="auth-card" style={{ width: "100%", maxWidth: "420px" }}>
        {/* 로고 영역: 미디어나리에 따라 모바일에서 가로폭 자동 축소 */}
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
          <h2>아이디 찾기</h2>
          <p>가입 시 등록한 정보로 아이디를 찾을 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="find-form">
          {message.text && (
            <div className={`auth-message ${message.type}`}>{message.text}</div>
          )}

          <div className="auth-field">
            <label className="auth-label">성함</label>
            <input
              className="auth-input"
              name="name"
              placeholder="이름을 입력하세요"
              value={form.name}
              onChange={handleChange}
              disabled={isVerified}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">이메일 주소</label>
            {/* 반응형인라인 그리드: 해상도가 극도로 좁아져도 인풋과 버튼이 뭉개지지 않도록 flex 배치 */}
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

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "조회 중..." : "아이디 찾기"}
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