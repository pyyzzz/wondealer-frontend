import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";
import logo from "../../img/logo.svg";
import "./auth.css";

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("fail");
      setMessage("유효하지 않은 인증 링크입니다.");
      return;
    }

    AuthApi.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        // sessionStorage 대신 localStorage에서 기존 입력 데이터를 안전하게 가져옵니다.
        const savedForm = JSON.parse(
          localStorage.getItem("signup_form_backUp") || "{}",
        );
        const finalEmail = res.data?.email || savedForm.email || "";

        setVerifiedEmail(finalEmail);
      })
      .catch((err) => {
        setStatus("fail");
        setMessage(
          err.response?.data?.message ||
            "인증에 실패했습니다. 링크가 만료되었거나 이미 사용된 링크입니다.",
        );
      });
  }, [searchParams]);

  const handleGoToSignup = () => {
    navigate(
      `/signup?verified=true&email=${encodeURIComponent(verifiedEmail)}`,
    );
  };

  if (status === "loading") {
    return (
      <div className="auth-page">
        <img
          src={logo}
          alt="WONDEALER"
          style={{ height: 40, marginBottom: 32 }}
        />
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <svg
              style={{ animation: "spin 1s linear infinite" }}
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b2b9ff"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h2 style={{ color: "#fff" }}>인증 확인 중...</h2>
          <p style={{ color: "#8f94a1" }}>잠시만 기다려주세요.</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-page">
        <img
          src={logo}
          alt="WONDEALER"
          style={{ height: 40, marginBottom: 32 }}
        />
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h2 style={{ color: "#fff", marginBottom: 8 }}>인증 완료!</h2>
          <p style={{ color: "#8f94a1", fontSize: 14 }}>
            아래 버튼을 눌러 회원가입을 완료해주세요.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "rgba(74, 222, 128, 0.08)",
              border: "1px solid rgba(74, 222, 128, 0.25)",
              borderRadius: 8,
              fontSize: 13,
              color: "#4ade80",
            }}
          >
            ✓ 이메일 인증이 성공했습니다. 회원가입 창으로 이동합니다.
          </div>
          <button
            className="auth-submit-btn"
            style={{ marginTop: 16, backgroundColor: "#4ade80", color: "#000" }}
            onClick={handleGoToSignup}
          >
            회원가입 계속하기
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <img
        src={logo}
        alt="WONDEALER"
        style={{ height: 40, marginBottom: 32 }}
      />
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h2 style={{ color: "#fff", marginBottom: 8 }}>인증 실패</h2>
        <p style={{ color: "#fca5a5", fontSize: 14 }}>{message}</p>
        <button
          className="auth-submit-btn"
          style={{ marginTop: 24 }}
          onClick={() => navigate("/signup")}
        >
          회원가입으로 돌아가기
        </button>
      </div>
    </div>
  );
}
