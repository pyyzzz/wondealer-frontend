import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Common from "../../utils/Common";
import {
  getBanReasonForAccount,
  getLatestBanReason,
  isBannedAccount,
} from "../../utils/adminLocalState";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    axios
      .get(`${Common.API_URL}/api/members/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data?.data || res.data;
        const banReason = getBanReasonForAccount(data, token);
        if (isBannedAccount(data) || banReason) {
          const message = `정지된 계정입니다. 사유: ${
            banReason || getLatestBanReason() || "관리자에 의해 정지된 계정입니다."
          }`;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.alert(message);
          navigate("/login", { replace: true });
          return;
        }

        const nickname =
          data?.nickname ||
          data?.name ||
          (data?.email ? data.email.split("@")[0] : "") ||
          "구글 사용자";

        login({
          accessToken: token,
          nickname,
          email: data?.email ?? null,
          authority: data?.authority ?? null,
        });

        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("내 정보 조회 실패:", err);
        const banReason = getBanReasonForAccount({}, token);
        if (banReason || getLatestBanReason()) {
          const message = `정지된 계정입니다. 사유: ${
            banReason || getLatestBanReason()
          }`;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.alert(message);
          navigate("/login", { replace: true });
          return;
        }
        login({ accessToken: token, nickname: "구글 사용자" });
        navigate("/", { replace: true });
      });
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        fontSize: 14,
        color: "#9ca3af",
      }}
    >
      로그인 처리 중...
    </div>
  );
}
