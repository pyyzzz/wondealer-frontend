import React from "react";
import styled from "styled-components";
import logo from "../img/logo.svg";

const Footer = () => {
  return (
    <FooterWrap>
      {/* 상단 섹션 */}
      <TopSection>
        <LinkGroup>
          <FooterLink href="#">아이템 마켓</FooterLink>
          <FooterLink href="#">경매</FooterLink>
          <FooterLink href="#">아이템 거래 내역</FooterLink>
          <FooterLink href="#">개인정보처리방침</FooterLink>
          <FooterLink href="#">위험 고지</FooterLink>
          <FooterLink href="#">고객센터</FooterLink>
        </LinkGroup>
      </TopSection>
      {/* 보안 문구 + 우측 로고 */}
      <MiddleSection>
        <SecuritySection>
          <SecurityTitle>🛡️ WonDealer Security</SecurityTitle>
          <SecurityDesc>
            본 거래는 WonDealer의 2단계 에스크로 보안 프로토콜에 의해
            보호됩니다.
            <br />
            판매자가 아이템을 인도하고 구매자가 수령을 확인하기 전까지 대금은
            안전하게 보관됩니다.
          </SecurityDesc>
        </SecuritySection>

        {/* 우측 로고 배치 */}
        <LogoBox>
          <FooterLogo src={logo} alt="WonDealer 로고" />
        </LogoBox>
      </MiddleSection>

      <Divider />

      {/* 카피라이트 */}
      <BottomSection>
        <Copyright>
          © 2026 WONDEALER DIGITAL ASSET EXCHANGE. ALL RIGHTS RESERVED.
        </Copyright>
      </BottomSection>
    </FooterWrap>
  );
};

// ── Styled Components ─────────────────────────────────────────
const FooterWrap = styled.footer`
  background-color: #0d0e12;
  border-top: 1px solid var(--border-color);
  padding: 20px 60px 30px;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 30px 20px 20px;
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 35px;
  width: 100%;
`;

const LinkGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }
`;

const MiddleSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  margin-top: 20px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const SecuritySection = styled.div`
  max-width: 480px;
  // margin-bottom: 24px;
`;

const SecurityTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #c7c4d7;
  margin-bottom: 8px;
`;

const SecurityDesc = styled.p`
  font-size: 12px;
  color: #c7c4d7;
  line-height: 1.6;
`;

const FooterLogo = styled.img`
  height: 45px;
  object-fit: contain;
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin-bottom: 20px;
  width: 100%;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
`;

const FooterLink = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }
`;

const Copyright = styled.p`
  font-size: 11px;
  color: #c7c4d7;
  letter-spacing: 0.5px;
`;

export default Footer;
