import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthApi from "../../api/auth.api";
import "./auth.css";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + "/oauth2/callback/google")}&response_type=code&scope=email%20profile`;

const TERMS = {
  service: {
    title: "원딜러 서비스 이용약관",
    content: `제1조 (목적)
본 약관은 원딜러(이하 "서비스")가 제공하는 게임 아이템 거래 중개 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.

제2조 (서비스 이용)
① 회원은 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.
② 미성년자는 법정대리인의 동의 없이 서비스를 이용할 수 없습니다.

제3조 (금지행위)
① 사기, 허위 매물 등록, 부정거래를 금지합니다.
② 타인의 계정을 무단으로 사용하는 행위를 금지합니다.
③ 서비스 운영을 방해하는 행위를 금지합니다.

제4조 (책임 제한)
원딜러는 회원 간 거래에서 발생하는 분쟁에 대해 직접적인 책임을 지지 않습니다. 단, WonPay 에스크로 서비스를 통한 거래는 보호됩니다.`,
  },
  privacy: {
    title: "개인정보 처리방침",
    content: `1. 수집하는 개인정보 항목
이메일, 아이디, 닉네임, 비밀번호(암호화 저장), 전화번호

2. 개인정보 수집 목적
회원 관리, 서비스 제공, 거래 안전 보장

3. 보유 및 이용 기간
회원 탈퇴 시까지 보유. 단, 관계 법령에 따라 일정 기간 보존할 수 있습니다.

4. 개인정보 제3자 제공
원칙적으로 외부에 제공하지 않습니다. 단, 법령에 의한 경우 예외입니다.

5. 이용자 권리
언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.`,
  },
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    marketing: false,
  });
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value })),
    [],
  );

  const toggleAll = (checked) =>
    setAgreements({ service: checked, privacy: checked, marketing: checked });

  const toggleOne = (key) => setAgreements((a) => ({ ...a, [key]: !a[key] }));

  const allChecked =
    agreements.service && agreements.privacy && agreements.marketing;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agreements.service || !agreements.privacy) {
      setError("필수 약관에 동의해주세요.");
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
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      // 백엔드 validation 에러 상세 메시지 파싱
      const data = err.response?.data;
      const msg =
        data?.message ||
        (data?.errors && Object.values(data.errors)[0]) ||
        "회원가입에 실패했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!agreements.service || !agreements.privacy) {
      setError("필수 약관에 동의 후 Google 회원가입을 진행해주세요.");
      return;
    }
    window.location.href = GOOGLE_AUTH_URL;
  };

  const fields = [
    {
      name: "username",
      label: "아이디",
      placeholder: "영문/숫자 조합 (4자 이상)",
      type: "text",
    },
    { name: "name", label: "이름", placeholder: "실명", type: "text" },
    {
      name: "nickname",
      label: "닉네임",
      placeholder: "게임 닉네임",
      type: "text",
    },
    {
      name: "email",
      label: "이메일",
      placeholder: "example@email.com",
      type: "email",
    },
    {
      name: "phone",
      label: "전화번호",
      placeholder: "010-0000-0000",
      type: "tel",
    },
    {
      name: "password",
      label: "비밀번호",
      placeholder: "8자 이상",
      type: "password",
    },
    {
      name: "passwordConfirm",
      label: "비밀번호 확인",
      placeholder: "비밀번호 재입력",
      type: "password",
    },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">WONDEALER</div>
        <div className="auth-title">회원가입</div>
        <div className="auth-hint" style={{ marginBottom: 20 }}>
          안전한 아이템 거래를 시작하세요
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          {fields.map((f) => (
            <div className="auth-field" key={f.name}>
              <label className="auth-label">{f.label}</label>
              <input
                className="auth-input"
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="auth-terms">
            <label className="auth-terms-all">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span>전체 동의</span>
            </label>

            <div className="auth-terms-divider" />

            <div className="auth-terms-row">
              <label>
                <input
                  type="checkbox"
                  checked={agreements.service}
                  onChange={() => toggleOne("service")}
                />
                <span>
                  <b>[필수]</b> 서비스 이용약관
                </span>
              </label>
              <button type="button" onClick={() => setModal("service")}>
                보기
              </button>
            </div>

            <div className="auth-terms-row">
              <label>
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={() => toggleOne("privacy")}
                />
                <span>
                  <b>[필수]</b> 개인정보 처리방침
                </span>
              </label>
              <button type="button" onClick={() => setModal("privacy")}>
                보기
              </button>
            </div>

            <div className="auth-terms-row">
              <label>
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={() => toggleOne("marketing")}
                />
                <span>[선택] 마케팅 정보 수신 동의</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <div className="auth-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>

      {modal && (
        <div className="auth-modal-backdrop" onClick={() => setModal(null)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-title">{TERMS[modal].title}</div>
            <pre className="auth-modal-content">{TERMS[modal].content}</pre>
            <button className="auth-modal-close" onClick={() => setModal(null)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
