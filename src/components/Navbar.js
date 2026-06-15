import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logoImg from "../img/logo.svg";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const nickname =
    user?.nickname ||
    user?.name ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "닉네임";

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }
    navigate(`/items?keyword=${encodeURIComponent(searchKeyword)}`);
  };

  return (
    <Nav>
      <LeftGroup>
        <Logo onClick={() => navigate("/")}>
          <LogoImage src={logoImg} alt="WONDEALER" />
        </Logo>
        <MenuButton onClick={() => navigate("/items/new")}>판매등록</MenuButton>
        <MenuButton onClick={() => navigate("/auctions/new")}>
          경매등록
        </MenuButton>
        <MenuButton onClick={() => navigate("/auctions")}>경매조회</MenuButton>
      </LeftGroup>

      <RightGroup>
        <SearchBar onSubmit={handleSearchSubmit}>
          <SearchInput
            placeholder="게임검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <SearchButton type="submit">🔍</SearchButton>
        </SearchBar>

        <IconButton onClick={() => navigate("/mypage/wallet")} title="지갑">
          <EmojiIcon>👛</EmojiIcon>
        </IconButton>

        <IconButton onClick={() => navigate("/chat")} title="채팅">
          <EmojiIcon>💬</EmojiIcon>
        </IconButton>

        <ThemeSwitcher>
          <IconButton onClick={() => setTheme("dark")} title="다크 모드">
            <EmojiIcon>🌙</EmojiIcon>
          </IconButton>
          <Separator>|</Separator>
          <IconButton onClick={() => setTheme("light")} title="라이트 모드">
            <EmojiIcon>☀️</EmojiIcon>
          </IconButton>
        </ThemeSwitcher>

        {isLoggedIn ? (
          <UserMenuContainer>
            <NicknameButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span>{nickname}</span>
              <span className="arrow">{isMenuOpen ? "⋀" : "⋁"}</span>
            </NicknameButton>

            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem className="title">{nickname}</DropdownItem>
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const LogoImage = styled.img`
  height: 32px;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 26px;
  }
  @media (max-width: 580px) {
    height: 22px;
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

const SearchBar = styled.form`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 30px;
  padding: 4px 4px 4px 20px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 260px;
  height: 38px;

  @media (max-width: 768px) {
    width: 200px;
  }
  @media (max-width: 580px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #121317;
  outline: none;
  padding: 0;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const SearchButton = styled.button`
  width: 30px;
  height: 30px;
  background-color: #6339f9;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-left: 8px;

  &:hover {
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
  transition: background-color 0.2s;

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
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-container-high);
  }

  @media (max-width: 580px) {
    padding: 4px;
  }
`;

const EmojiIcon = styled.span`
  font-size: 18px;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  user-select: none;

  @media (max-width: 580px) {
    font-size: 15px;
  }
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
