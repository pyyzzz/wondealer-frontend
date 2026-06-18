import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import walletIcon from "../img/walletIcon.svg";
import chatIcon from "../img/chatIcon.svg";
import logo from "../img/logo.svg";
import sun from "../img/sun.svg";
import moon from "../img/moon.svg";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 url 주소 감지
  const { theme, setTheme } = useTheme();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e.key && e.key !== "Enter") return;

    if (!searchKeyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchKeyword)}`);
  };

  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <Nav>
      <LeftGroup>
        <Logo onClick={() => navigate("/")}>
          <LogoImg src={logo} alt="WONDEALER" />
        </Logo>
        {!isAdminPage && (
          <>
            <MenuButton onClick={() => navigate("/items/new")}>
              판매등록
            </MenuButton>
            <MenuButton onClick={() => navigate("/auctions/new")}>
              경매등록
            </MenuButton>
            <MenuButton onClick={() => navigate("/auctions")}>
              경매조회
            </MenuButton>
          </>
        )}
      </LeftGroup>

      <RightGroup>
        {!isAdminPage && (
          <>
            <SearchBar>
              <SearchInput
                placeholder="게임 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearch}
              />
              <SearchButton onClick={handleSearch}>검색</SearchButton>
            </SearchBar>

            <IconButton
              onClick={() => handleProtectedNavigation("/mypage/wallet")}
            >
              <IconImg src={walletIcon} alt="지갑" />
            </IconButton>

            <IconButton onClick={() => handleProtectedNavigation("/chat")}>
              <IconImg src={chatIcon} alt="채팅" />
            </IconButton>
          </>
        )}

        <ThemeSwitcher>
          <IconButton
            $active={theme === "dark"}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            <IconImg src={moon} alt="다크 모드" />
          </IconButton>
          <Separator>|</Separator>
          <IconButton
            $active={theme === "light"}
            aria-pressed={theme === "light"}
            onClick={() => setTheme("light")}
          >
            <IconImg src={sun} alt="라이트 모드" />
          </IconButton>
        </ThemeSwitcher>

        {isLoggedIn ? (
          <UserMenuContainer>
            <NicknameButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span>{user?.nickname || "닉네임"}</span>
              <span className="arrow">{isMenuOpen ? "▲" : "▼"}</span>
            </NicknameButton>

            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem className="title">
                  {user?.nickname || "닉네임"}
                </DropdownItem>
                {!isAdminPage && (
                  <DropdownItem
                    onClick={() => {
                      navigate("/mypage");
                      setIsMenuOpen(false);
                    }}
                  >
                    마이페이지
                  </DropdownItem>
                )}
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

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background-color: var(--bg-container, var(--surface-container));
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
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
  cursor: pointer;
  margin-right: -15px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    margin-right: -25px;
  }

  @media (max-width: 580px) {
    margin-right: 0;
  }
`;

const LogoImg = styled.img`
  height: 90px;
  width: 220px;
  flex-shrink: 0;
  object-fit: contain;
  filter: none !important;
  margin-left: -25px;

  @media (max-width: 768px) {
    width: 180px;
    height: 80px;
    margin-left: -20px;
  }

  @media (max-width: 580px) {
    width: 140px;
    height: 60px;
    margin-left: -15px;
  }
`;

const MenuButton = styled.button`
  color: var(--text-secondary);
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
    background-color: var(--primary);
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
  background-color: var(--bg-container-high, var(--surface-container-low));
  border: 1px solid var(--border-color);
  border-radius: 30px;
  padding: 4px 4px 4px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 260px;
  height: 38px;

  @media (max-width: 768px) {
    width: 200px;
  }
  @media (max-width: 580px) {
    display: none;
  }

  &:focus-within {
    border-color: var(--color-primary);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  padding: 0;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 1;
  }
`;

const SearchButton = styled.button`
  height: 30px;
  min-width: 52px;
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--on-primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
  margin-left: 8px;
  padding: 0 12px;

  &:hover {
    background-color: var(--primary-container);
    border-color: var(--primary-container);
    transform: scale(1.05);
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

const IconImg = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
`;

const ThemeSwitcher = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Separator = styled.span`
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 200;
  margin: 0 2px;
  user-select: none;
`;

const SignUpButton = styled(NavButton)`
  background-color: var(--color-primary);
  color: var(--on-primary);
  font-weight: 600;
  border: 1px solid var(--color-primary);

  &:hover {
    background-color: var(--primary-container);
    border-color: var(--primary-container);
    color: var(--on-primary);
  }
`;

const IconButton = styled.button`
  font-size: 18px;
  padding: 6px;
  border-radius: 6px;
  background-color: ${(props) =>
    props.$active ? "var(--bg-container-high)" : "transparent"};
  outline: ${(props) =>
    props.$active ? "1px solid var(--color-primary)" : "none"};

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
  background-color: var(--surface-container-high);
  color: var(--on-surface);
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
    background-color: var(--surface-bright);
  }

  .arrow {
    font-size: 10px;
    color: var(--outline);
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
  background-color: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  padding: 6px 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--surface-container-high);
    color: var(--on-surface);
  }

  &.title {
    font-weight: 700;
    color: var(--on-surface);
    cursor: default;
    border-bottom: 1px solid var(--outline-variant);
    padding-bottom: 12px;
    margin-bottom: 4px;

    &:hover {
      background: none;
    }
  }
`;

export default Navbar;
