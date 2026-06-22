import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ItemApi from "../api/item.api";

import walletIcon from "../img/walletIcon.svg";
import chatIcon from "../img/chatIcon.svg";
import logo from "../img/logo.svg";
import sun from "../img/sun.svg";
import moon from "../img/moon.svg";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [games, setGames] = useState([]); // ✅ 게임 목록

  const isAdminPage = location.pathname.startsWith("/admin");

  // 닉네임 표시: nickname 우선, 없으면 email 앞부분
  const displayName =
    user?.nickname ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    user?.username ||
    "사용자";

  // ✅ 게임 목록 로드 (관리자 페이지 제외)
  useEffect(() => {
    if (isAdminPage) return;
    ItemApi.getGames()
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setGames(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, [isAdminPage]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  // ✅ 게임명 매칭 → /items?gameId=xxx, 없으면 /items?keyword=xxx
  const handleSearch = (e) => {
    if (e?.key !== undefined && e.key !== "Enter") return;

    const kw = searchKeyword.trim();
    if (!kw) {
      alert("검색어를 입력하세요.");
      return;
    }

    const matched = games.find((g) =>
      (g.gameName ?? g.name ?? "").toLowerCase().includes(kw.toLowerCase()),
    );

    if (matched) {
      const gameId = matched.gameId ?? matched.id;
      navigate(`/items?gameId=${gameId}`);
    } else {
      navigate(`/items?keyword=${encodeURIComponent(kw)}`);
    }

    setSearchKeyword("");
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
              title="지갑"
            >
              <IconImg src={walletIcon} alt="지갑" />
            </IconButton>

            <IconButton
              onClick={() => handleProtectedNavigation("/chat")}
              title="채팅"
            >
              <IconImg src={chatIcon} alt="채팅" />
            </IconButton>
          </>
        )}

        <ThemeSwitcher>
          <IconButton
            $active={theme === "dark"}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme("dark")}
            title="다크 모드"
          >
            <IconImg src={moon} alt="다크 모드" />
          </IconButton>
          <Separator>|</Separator>
          <IconButton
            $active={theme === "light"}
            aria-pressed={theme === "light"}
            onClick={() => setTheme("light")}
            title="라이트 모드"
          >
            <IconImg src={sun} alt="라이트 모드" />
          </IconButton>
        </ThemeSwitcher>

        {isLoggedIn ? (
          <UserMenuContainer>
            <NicknameButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span>{displayName}</span>
              <span className="arrow">{isMenuOpen ? "▲" : "▼"}</span>
            </NicknameButton>

            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem className="title">{displayName}</DropdownItem>
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

// ==========================================
// Styled Components
// ==========================================

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background-color: var(--surface-container);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0 16px;
  }

  @media (max-width: 420px) {
    padding: 0 10px;
    gap: 8px;
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
  min-width: 0;

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

  @media (max-width: 420px) {
    width: 112px;
    margin-left: -8px;
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
  background-color: #ffffff;
  border-radius: 30px;
  padding: 4px 4px 4px 20px;
  border: 1px solid var(--border-color, #e1e4e6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  color: #121317 !important;
  outline: none;
  padding: 0;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const SearchButton = styled.button`
  height: 30px;
  min-width: 44px;
  background-color: var(--primary);
  border: none;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--on-primary);
  font-size: 12px;
  font-weight: 700;
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
    background-color: var(--primary-container);
    border-color: var(--primary-container);
    color: var(--on-primary);
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
  background-color: ${(props) =>
    props.$active ? "var(--bg-container-high)" : "transparent"};
  outline: ${(props) =>
    props.$active ? "1px solid var(--color-primary)" : "none"};

  &:hover {
    background-color: var(--bg-container-high);
  }

  @media (max-width: 580px) {
    padding: 4px;
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

  @media (max-width: 420px) {
    gap: 0;
  }
`;

const Separator = styled.span`
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 200;
  margin: 0 2px;
  user-select: none;

  @media (max-width: 420px) {
    display: none;
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

  span:first-child {
    max-width: 96px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 420px) {
    padding: 6px 8px;

    span:first-child {
      max-width: 64px;
    }
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
