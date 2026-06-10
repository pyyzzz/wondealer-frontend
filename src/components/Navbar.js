import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme(); // ThemeContext에서 테마 가져옴

  const [searchKeyword, setSearchKeyword] = useState(""); // 네비바 검색어 입력

  const [isMenuOpen, setIsMenuOpen] = useState(false); // 로그인 완료 후 닉네임 드롭다운

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // 로그아웃 시 드롭다운 닫기
    navigate("/");
  };
  // 검색바 실행
  const handleSearch = (e) => {
    if (e.key && e.key !== "Enter") return;

    if (!searchKeyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchKeyword)}`);
  };

  return (
    <Nav>
      <LeftGroup>
        {/* 로고 */}
        <Logo onClick={() => navigate("/")}>WONDEALER</Logo>
        {/* 판매/경매 등록 버튼 */}
        <MenuButton onClick={() => navigate("/items/new")}>판매등록</MenuButton>
        <MenuButton onClick={() => navigate("/auctions/new")}>
          경매등록
        </MenuButton>
        <MenuButton onClick={() => navigate("/auctions/new")}>
          경매조회
        </MenuButton>
      </LeftGroup>

      <RightGroup>
        {/* 검색바 */}
        <SearchBar>
          <SearchInput
            placeholder="게임검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearch}
          />
          <SearchButton onClick={handleSearch}>🔍</SearchButton>
        </SearchBar>

        {/* 아이콘 메뉴 */}
        <IconButton onClick={() => navigate("/mypage/wallet")}>💰</IconButton>
        <IconButton onClick={() => navigate("/chat")}>💬</IconButton>
        <IconButton onClick={toggleTheme}>
          {" "}
          {theme === "dark" ? "☀️" : "🌙"}
        </IconButton>

        {isLoggedIn ? (
          <UserMenuContainer>
            <NicknameButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span>{user?.nickname || "닉네임"}</span>
              <span className="arrow">{isMenuOpen ? "⋀" : "⋁"}</span>
            </NicknameButton>

            {/* 드롭다운 메뉴 (isMenuOpen이 true일 때만 노출) */}
            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem className="title">
                  {user?.nickname || "닉네임"}
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    navigate("/mypage");
                    setIsMenuOpen(false);
                  }}
                >
                  마이페이지
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>로그아웃</DropdownItem>
              </DropdownMenu>
            )}
          </UserMenuContainer>
        ) : (
          <>
            <NavButton onClick={() => navigate("/login")}>로그인</NavButton>
            <SignUpButton onClick={() => navigate("/signup")}>
              회원가입
            </SignUpButton>
          </>
        )}
      </RightGroup>
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

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary);
  cursor: pointer;
  letter-spacing: -0.02em;
  margin-right: 8px;

  @media (max-width: 580px) {
    font-size: 16px;
    margin-right: 0;
  }
`;

const MenuButton = styled.button`
  color: ${(props) =>
    props.$active ? "var(--text-primary)" : "var(--text-secondary)"};
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0 4px;
  cursor: pointer;
  height: 100%;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #c0c1ff;
    display: none;
  }

  &:hover::after {
    display: block;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  padding: 0 12px;
  width: 240px;
  height: 36px;
  margin-right: 12px;

  @media (max-width: 768px) {
    width: 180px;
    margin-right: 4px;
    padding: 0 8px;
  }
  @media (max-width: 580px) {
    width: 110px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: #333333;
  font-size: 14px;
  outline: none;
  &::placeholder {
    color: #999999;
  }
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const SearchButton = styled.button`
  background-color: #512bd4;
  color: #ffffff;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: #512bd4;
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
`;

const NavButton = styled.button`
  color: var(--text-primary);
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: var(--bg-container-high);
  }

  @media (max-width: 580px) {
    font-size: 12px;
    padding: 6px 8px;
  }
`;

const SignUpButton = styled(NavButton)`
  background-color: var(--color-primary);
  color: var(--on-primary);
  font-weight: 600;
  border: 1px solid var(--color-primary);

  &:hover {
    background-color: #512bd4;
    border-color: #512bd4;
    color: var(--text-primary);
  }
`;

const IconButton = styled.button`
  font-size: 18px;
  padding: 6px;
  border-radius: 6px;
  &:hover {
    background-color: var(--bg-container-high);
  }
  @media (max-width: 580px) {
    font-size: 16px;
    padding: 4px;
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NicknameButton = styled.button`
  background-color: #2a2b2e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #38393d;
  }

  .arrow {
    font-size: 10px;
    color: #aaaaaa;
  }
  @media (max-width: 580px) {
    padding: 6px 10px;
    font-size: 12px;
    gap: 4px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 140px;
  background-color: #1e1f22;
  border: 1px solid #2d2f34;
  border-radius: 12px;
  padding: 6px 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2a2b2e;
    color: #ffffff;
  }

  &.title {
    font-weight: 700;
    color: #ffffff;
    cursor: default;
    border-bottom: 1px solid #2d2f34;
    padding-bottom: 12px;
    margin-bottom: 4px;
    &:hover {
      background: none;
    }
  }
`;

export default Navbar;
