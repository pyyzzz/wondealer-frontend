import styled from "styled-components";

const Footer = () => {
  return (
    <FooterWrap>
      {/* 보안 문구 */}
      <SecuritySection>
        <SecurityTitle>🛡️ WonDealer Security</SecurityTitle>
        <SecurityDesc>
          본 거래는 WonDealer의 2단계 에스크로 보안 프로토콜에 의해 보호됩니다.
          판매자가 아이템을 인도하고 구매자가 수령을 확인하기 전까지 대금은 안전하게 보관됩니다.
        </SecurityDesc>
      </SecuritySection>

      <Divider />

      {/* 하단 링크 + 카피라이트 */}
      <BottomSection>
        <LinkGroup>
          <FooterLink href="#">사업자정보</FooterLink>
          <FooterLink href="#">이용약관</FooterLink>
          <FooterLink href="#">개인정보처리방침</FooterLink>
          <FooterLink href="#">FAQ</FooterLink>
          <FooterLink href="#">1:1문의</FooterLink>
        </LinkGroup>
        <Copyright>© 2024 WONDEALER DIGITAL ASSET EXCHANGE. ALL RIGHTS RESERVED.</Copyright>
      </BottomSection>
    </FooterWrap>
  );
};

// ── Styled Components ─────────────────────────────────────────
const FooterWrap = styled.footer`
  background-color: var(--bg-container-low);
  border-top: 1px solid var(--border-color);
  padding: 32px 24px 24px;
  margin-top: auto;
`;

const SecuritySection = styled.div`
  max-width: 480px;
  margin-bottom: 24px;
`;

const SecurityTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const SecurityDesc = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin-bottom: 20px;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const LinkGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const FooterLink = styled.a`
  font-size: 12px;
  color: var(--text-secondary);
  &:hover { color: var(--text-primary); }
`;

const Copyright = styled.p`
  font-size: 11px;
  color: var(--outline);
`;

export default Footer;
