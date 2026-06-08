import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Nav>
      {/* 로고 */}
      <Logo onClick={() => navigate("/")}>WONDEALER</Logo>

      {/* 검색바 */}
      <SearchBar>
        <SearchInput placeholder="아이템, 키워드 검색" />
        <SearchButton>🔍</SearchButton>
      </SearchBar>

      {/* 우측 메뉴 */}
      <RightMenu>
        {/* 판매/경매 등록 버튼 */}
        <NavButton onClick={() => navigate("/items/new")}>판매등록</NavButton>
        <NavButton onClick={() => navigate("/auctions/new")}>경매등록</NavButton>

        {/* 아이콘 메뉴 */}
        <IconButton onClick={() => navigate("/mypage/wallet")}>💰</IconButton>
        <IconButton onClick={() => navigate("/chat")}>💬</IconButton>

        {/* 로그인 상태에 따라 분기 */}
        {isLoggedIn ? (
          <>
            <Nickname onClick={() => navigate("/mypage")}>{user?.nickname}</Nickname>
            <NavButton onClick={handleLogout}>로그아웃</NavButton>
          </>
        ) : (
          <>
            <NavButton onClick={() => navigate("/login")}>로그인</NavButton>
            <SignUpButton onClick={() => navigate("/signup")}>회원가입</SignUpButton>
          </>
        )}
      </RightMenu>
    </Nav>
  );
};

// ── Styled Components ─────────────────────────────────────────
const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background-color: var(--bg-container);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary);
  cursor: pointer;
  letter-spacing: -0.02em;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-container-high);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0 12px;
  width: 340px;
  height: 36px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  &::placeholder { color: var(--text-secondary); }
`;

const SearchButton = styled.button`
  color: var(--text-secondary);
  font-size: 16px;
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  &:hover { background-color: var(--bg-container-high); }
`;

const SignUpButton = styled(NavButton)`
  background-color: var(--color-primary);
  color: var(--on-primary);
  &:hover { opacity: 0.9; }
`;

const IconButton = styled.button`
  font-size: 18px;
  padding: 6px;
  border-radius: 6px;
  &:hover { background-color: var(--bg-container-high); }
`;

const Nickname = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
`;

export default Navbar;
