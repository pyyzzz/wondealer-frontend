import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PaymentPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const item = location.state?.item || {
    id: 'item-demo',
    title: '데모 아이템',
    game: 'LOST ARK',
    category: '무기',
    price: 500000,
    imageUrl: '⚔️',
    seller: '판매자',
    gameServer: '실리안',
    trade_type: 'DIRECT',
  };

  const transactionFee = Math.floor(item.price * 0.01);
  const totalAmount    = item.price + transactionFee;
  const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white">
      {/* 단계 표시 */}
      <div className="flex items-center justify-center gap-12 mb-12 border-b border-zinc-900 pb-8">
        {[
          { num: '01', label: '주문 정보', step: 1 },
          { num: '02', label: '결제 방법', step: 2 },
          { num: '03', label: '결제 완료', step: 3 },
        ].map((s, i) => (
          <div key={s.step} className="flex items-center gap-3" style={{ opacity: step >= s.step ? 1 : 0.3 }}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s.step ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' :
              step > s.step  ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>{s.num}</span>
            <span className="text-xs font-bold text-zinc-400">{s.label}</span>
            {i < 2 && <div className="h-0.5 bg-zinc-800 w-12 ml-3" />}
          </div>
        ))}
      </div>

      {step === 2 && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 주문 요약 */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-sm font-black text-zinc-300 border-b border-zinc-900 pb-3 mb-5">📦 주문 물품 요약</h2>
              <div className="flex bg-zinc-900/50 border border-zinc-900 p-4 rounded-xl items-center gap-4 mb-6">
                <span className="text-4xl">{item.imageUrl || '📦'}</span>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">{item.game} · {item.gameServer}</span>
                  <h3 className="text-xs font-extrabold text-zinc-100 leading-tight">{item.title}</h3>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">판매자: {item.seller}</span>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-zinc-400"><span>상품 정가</span><span className="font-bold font-mono">{fmt(item.price)}원</span></div>
                <div className="flex justify-between text-zinc-400"><span>중개 수수료 (1%)</span><span className="font-bold text-zinc-300 font-mono">+{fmt(transactionFee)}원</span></div>
                <div className="flex justify-between text-emerald-400"><span>수수료 감사 할인</span><span className="font-bold font-mono">-0원</span></div>
              </div>
            </div>
            <div className="border-t border-zinc-900 mt-6 pt-5 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-zinc-500 block">최종 결제 총액</span>
                <span className="text-xl font-black text-blue-400 font-mono">{fmt(totalAmount)}원</span>
              </div>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="space-y-6">
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-zinc-300 border-b border-zinc-900 pb-3">💳 결제 수단 선택</h2>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'card',     icon: '💳', label: '신용카드 결제',      desc: '삼성, 국민, 비씨, 현대카드 가능' },
                  { value: 'vaccount', icon: '🏦', label: '가상계좌',           desc: '무통장 주문 입금 전용' },
                  { value: 'transfer', icon: '🔄', label: '실시간 계좌이체',    desc: '은행 실시간 이관' },
                  { value: 'simple',   icon: '📱', label: '간편결제 (카카오/토스)', desc: '1초 간편 인증', recommend: true },
                ].map((m) => (
                  <button type="button" key={m.value} onClick={() => setPaymentMethod(m.value)}
                    className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex justify-between items-center ${
                      paymentMethod === m.value ? 'bg-blue-950/20 border-blue-500 text-blue-400' : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:bg-zinc-900'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span>{m.icon}</span>
                      <div>
                        <span>{m.label}</span>
                        <span className="text-[9px] font-normal text-zinc-500 block mt-0.5">{m.desc}</span>
                      </div>
                    </div>
                    {m.recommend && <span className="text-[9px] text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">RECOMMEND</span>}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 py-4 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2">
              {isProcessing ? <><span className="animate-spin">🔄</span><span>결제 승인 요청 중...</span></> : <span>{fmt(totalAmount)}원 결제 요청하기</span>}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-12 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto">✓</div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-100">안심 대금 결제가 완료되었습니다!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">판매자의 아이템 인계를 기다려 주세요. 에스크로로 대금이 안전하게 보관됩니다.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-left text-xs space-y-2.5">
            <div className="flex justify-between"><span className="text-zinc-500">주문 상품</span><span className="font-bold text-zinc-200">{item.title}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">결제된 대금</span><span className="font-bold text-blue-400 font-mono">{fmt(totalAmount)}원</span></div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => navigate('/mypage')} className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-3 rounded-xl text-xs font-bold transition-all">내 마이페이지 보기</button>
            <button onClick={() => navigate('/items')} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-xs font-bold transition-all">아이템 더 보기</button>
          </div>
        </div>
      )}
    </div>
  );
}
