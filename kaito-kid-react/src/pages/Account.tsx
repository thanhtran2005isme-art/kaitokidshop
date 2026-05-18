// Trang tÃ i khoáº£n â€” Gamification edition
// Hiá»ƒn thá»‹: cáº¥p báº­c, Ä‘iá»ƒm thÆ°á»Ÿng, lá»™ trÃ¬nh tiáº¿n tier, Ä‘á»•i Ä‘iá»ƒm, voucher cÃ¡ nhÃ¢n, lá»‹ch sá»­

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PiCrownSimpleFill,
  PiCoinsFill,
  PiCalendarBlankFill,
  PiPhoneFill,
  PiEnvelopeSimple,
  PiUserCircleFill,
  PiPackageFill,
  PiTrendUpBold,
  PiGiftFill,
  PiTicketFill,
  PiClockClockwiseBold,
  PiSignOut,
  PiPencilSimpleLineFill,
  PiCheckCircleFill,
  PiCopyBold,
} from 'react-icons/pi';
import { useAuth } from '../context/AuthContext';
import { accountApi, type AccountDTO, type PointsHistoryDTO, type PersonalVoucher } from '../services/api';
import AvatarUploader from '../components/AvatarUploader';
import { authApi } from '../services/api/authApi';
import { PiShieldCheckBold, PiClockCounterClockwiseBold as PiClockHistory, PiQrCodeBold } from 'react-icons/pi';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

type TabKey = 'overview' | 'profile' | 'points' | 'vouchers' | 'security';

const TIER_META: Record<string, { color: string; bg: string; icon: string; perks: string[] }> = {
  Member:  { color: '#475569', bg: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)', icon: 'ðŸ¥‰', perks: ['TÃ­ch Ä‘iá»ƒm 1%', 'Sinh nháº­t giáº£m 5%'] },
  Silver:  { color: '#0f172a', bg: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)', icon: 'ðŸ¥ˆ', perks: ['TÃ­ch Ä‘iá»ƒm 1.5%', 'Sinh nháº­t giáº£m 10%', 'Freeship Ä‘Æ¡n tá»« 399k'] },
  Gold:    { color: '#7c2d12', bg: 'linear-gradient(135deg, #fde047 0%, #ca8a04 100%)', icon: 'ðŸ¥‡', perks: ['TÃ­ch Ä‘iá»ƒm 2%', 'Sinh nháº­t giáº£m 15%', 'Freeship Ä‘Æ¡n tá»« 299k', 'Táº·ng quÃ  sinh nháº­t'] },
  Diamond: { color: '#1e3a8a', bg: 'linear-gradient(135deg, #93c5fd 0%, #6366f1 100%)', icon: 'ðŸ’Ž', perks: ['TÃ­ch Ä‘iá»ƒm 3%', 'Sinh nháº­t giáº£m 20%', 'Freeship toÃ n bá»™ Ä‘Æ¡n', 'QuÃ  sinh nháº­t + Black card', 'Hotline VIP 24/7'] },
};

const REDEEM_TIERS = [
  { points: 100, value: 10_000 },
  { points: 300, value: 35_000 },
  { points: 500, value: 60_000 },
  { points: 1000, value: 130_000 },
];

export default function Account() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<AccountDTO | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({ name: '', phone: '', birthday: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState<PointsHistoryDTO[]>([]);
  const [vouchers, setVouchers] = useState<PersonalVoucher[]>([]);
  const [redeemingPoints, setRedeemingPoints] = useState<number | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const r = await accountApi.getProfile();
    if (r.success && r.data) {
      setProfile(r.data);
      setEditForm({
        name: r.data.name || '',
        phone: r.data.phone || '',
        birthday: r.data.birthday ? r.data.birthday.split('T')[0] : '',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (activeTab === 'points') {
      void accountApi.getPointsHistory().then((r) => r.success && r.data && setHistory(r.data));
    } else if (activeTab === 'vouchers') {
      void accountApi.getMyVouchers().then((r) => r.success && r.data && setVouchers(r.data));
    }
  }, [activeTab]);

  const handleSave = async () => {
    if (editForm.birthday) {
      const bd = new Date(editForm.birthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(bd.getTime())) {
        toast.error('Ngày sinh không hợp lệ');
        return;
      }
      if (bd > today) {
        toast.error('Ngày sinh không được ở tương lai');
        return;
      }
      const minYear = new Date();
      minYear.setFullYear(today.getFullYear() - 120);
      if (bd < minYear) {
        toast.error('Ngày sinh không hợp lệ');
        return;
      }
    }
    setSaving(true);
    const r = await accountApi.updateProfile({
      name: editForm.name || undefined,
      phone: editForm.phone || undefined,
      birthday: editForm.birthday || undefined,
    });
    setSaving(false);
    if (r.success && r.data) {
      setProfile(r.data);
      setEditing(false);
      toast.success('ÄÃ£ cáº­p nháº­t thÃ´ng tin');
    } else {
      toast.error(r.error || 'Cáº­p nháº­t tháº¥t báº¡i');
    }
  };

  const handleAvatarSave = async (blob: Blob) => {
    const r = await accountApi.uploadAvatar(blob);
    if (r.success && r.data) {
      // Backend đã update User.Avatar. Gọi getProfile để có URL mới (kèm cache-bust nhẹ).
      const pr = await accountApi.getProfile();
      if (pr.success && pr.data) setProfile(pr.data);
      toast.success('Đã cập nhật ảnh đại diện');
    } else {
      toast.error(r.error || 'Tải ảnh thất bại');
    }
  };
  const handleRedeem = async (points: number) => {
    if (!profile || profile.loyaltyPoints < points) {
      toast.error('Báº¡n khÃ´ng Ä‘á»§ Ä‘iá»ƒm');
      return;
    }
    if (!confirm(`Äá»•i ${points} Ä‘iá»ƒm Ä‘á»ƒ láº¥y voucher giáº£m ${formatCurrency(points * 100)}?`)) return;
    setRedeemingPoints(points);
    const r = await accountApi.redeemPoints(points);
    setRedeemingPoints(null);
    if (r.success && r.data) {
      toast.success(`ÄÃ£ táº¡o voucher ${r.data.couponCode} â€” giáº£m ${formatCurrency(r.data.discountValue)}`);
      void loadProfile();
      void accountApi.getMyVouchers().then((vr) => vr.success && vr.data && setVouchers(vr.data));
      setActiveTab('vouchers');
    } else {
      toast.error(r.error || 'Äá»•i Ä‘iá»ƒm tháº¥t báº¡i');
    }
  };

  // Tự động đề xuất voucher sinh nhật khi user vào trang trong tháng sinh.
  useEffect(() => {
    if (!profile?.birthday) return;
    const flag = 'kk-bday-claimed-' + profile.id + '-' + new Date().getFullYear();
    if (sessionStorage.getItem(flag)) return;
    const bd = new Date(profile.birthday);
    if (Number.isNaN(bd.getTime())) return;
    if (bd.getMonth() !== new Date().getMonth()) return;
    sessionStorage.setItem(flag, '1');
    void accountApi.claimBirthdayVoucher().then((r) => {
      if (r.success && r.data) {
        toast.success(r.data.message || 'Đã nhận voucher sinh nhật!');
        void accountApi.getMyVouchers().then((vr) => vr.success && vr.data && setVouchers(vr.data));
      }
      // Im lặng nếu BadRequest (đã claim hoặc không trong tháng) — không làm phiền user
    });
  }, [profile?.id, profile?.birthday]);
  if (loading || !profile) {
    return <div style={{ padding: 80, textAlign: 'center', color: '#64748b' }}>Äang táº£i tÃ i khoáº£n...</div>;
  }

  const tier = TIER_META[profile.memberTier] || TIER_META.Member;
  const tierPct = profile.nextTierAt > 0
    ? Math.min(100, Math.round((profile.totalSpent / profile.nextTierAt) * 100))
    : 100;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* HEADER CARD */}
      <div style={{
        background: tier.bg,
        borderRadius: 16,
        padding: '28px 32px',
        color: tier.color,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.15 }}>{tier.icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, color: '#fff',
          }}>
            {(profile.name || 'K').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.85 }}>
              {tier.icon} ThÃ nh viÃªn {profile.memberTier}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>
              Xin chÃ o, {profile.name}!
            </div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
              ÄÃ£ cÃ¹ng KaitoKid {Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} ngÃ y
            </div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            style={{
              background: 'rgba(0,0,0,0.15)', color: '#fff', border: 'none',
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <PiSignOut /> ÄÄƒng xuáº¥t
          </button>
        </div>

        {/* Tier progress */}
        {profile.amountToNextTier > 0 && profile.nextTier !== profile.memberTier && (
          <div style={{ marginTop: 24, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span><PiTrendUpBold style={{ verticalAlign: -2 }} /> CÃ²n {formatCurrency(profile.amountToNextTier)} Ä‘á»ƒ lÃªn háº¡ng <strong>{profile.nextTier}</strong></span>
              <span style={{ fontWeight: 600 }}>{tierPct}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.3)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ background: '#fff', height: '100%', width: `${tierPct}%`, transition: 'width 0.6s' }} />
            </div>
          </div>
        )}
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, margin: '20px 0' }}>
        <StatCard icon={<PiCoinsFill />} value={profile.loyaltyPoints} label="Äiá»ƒm thÆ°á»Ÿng" color="#f59e0b" hint={`= ${formatCurrency(profile.loyaltyPoints * 100)}`} />
        <StatCard icon={<PiPackageFill />} value={profile.totalOrders} label="ÄÆ¡n hÃ ng" color="#6366f1" />
        <StatCard icon={<PiCrownSimpleFill />} value={profile.memberTier} label="Cáº¥p báº­c" color={tier.color} isText />
        <StatCard icon={<PiTicketFill />} value={vouchers.length} label="Voucher cÃ¡ nhÃ¢n" color="#ec4899" />
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {([
            ['overview', 'Tá»•ng quan', PiUserCircleFill],
            ['profile', 'ThÃ´ng tin', PiPencilSimpleLineFill],
            ['points', 'Äiá»ƒm thÆ°á»Ÿng', PiCoinsFill],
            ['vouchers', 'Voucher', PiTicketFill],
            ['security', 'Báº£o máº­t', PiShieldCheckBold],
          ] as [TabKey, string, typeof PiUserCircleFill][]).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              style={{
                flex: '0 0 auto', padding: '14px 22px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontSize: 14,
                fontWeight: activeTab === k ? 600 : 500,
                color: activeTab === k ? '#ec4899' : '#64748b',
                borderBottom: `2px solid ${activeTab === k ? '#ec4899' : 'transparent'}`,
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 28 }}>
          {/* ===== OVERVIEW ===== */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Card title="Quyá»n lá»£i cáº¥p báº­c cá»§a báº¡n" icon={<PiCrownSimpleFill style={{ color: '#f59e0b' }} />}>
                <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9, fontSize: 14 }}>
                  {tier.perks.map((p) => (
                    <li key={p}><PiCheckCircleFill style={{ color: '#16a34a', verticalAlign: -3, marginRight: 6 }} />{p}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Lá»™ trÃ¬nh thÄƒng háº¡ng" icon={<PiTrendUpBold style={{ color: '#6366f1' }} />}>
                <div style={{ fontSize: 13, lineHeight: 1.8, color: '#475569' }}>
                  {profile.memberTier !== 'Diamond' ? (
                    <>
                      Mua thÃªm <strong style={{ color: '#0f172a' }}>{formatCurrency(profile.amountToNextTier)}</strong> Ä‘á»ƒ
                      Ä‘áº¡t háº¡ng <strong style={{ color: '#ec4899' }}>{profile.nextTier}</strong>.
                      <br />Má»—i Ä‘Æ¡n hÃ ng Ä‘á»u Ä‘Æ°á»£c tÃ­ch vÃ o háº¡ng tiáº¿p theo.
                    </>
                  ) : (
                    <>ðŸŽ‰ Báº¡n Ä‘Ã£ Ä‘áº¡t háº¡ng cao nháº¥t Diamond!</>
                  )}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e5e7eb', fontSize: 13, color: '#64748b' }}>
                  <PiCalendarBlankFill style={{ verticalAlign: -2 }} /> Tá»•ng chi tiÃªu: <strong style={{ color: '#0f172a' }}>{formatCurrency(profile.totalSpent)}</strong>
                </div>
              </Card>
            </div>
          )}

          {/* ===== PROFILE ===== */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: 600 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>ThÃ´ng tin cÃ¡ nhÃ¢n</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Há» vÃ  tÃªn" icon={<PiUserCircleFill />}>
                  {editing ? (
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                  ) : <div style={readonly}>{profile.name}</div>}
                </Field>
                <Field label="Sá»‘ Ä‘iá»‡n thoáº¡i" icon={<PiPhoneFill />}>
                  {editing ? (
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} />
                  ) : <div style={readonly}>{profile.phone || 'â€”'}</div>}
                </Field>
                <Field label="Email" icon={<PiEnvelopeSimple />}>
                  <div style={{ ...readonly, color: '#94a3b8' }}>{profile.email}</div>
                </Field>
                <Field label="NgÃ y sinh" icon={<PiCalendarBlankFill />}>
                  {editing ? (
                    <input type="date" value={editForm.birthday} onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })} style={inputStyle} />
                  ) : (
                    <div style={readonly}>{profile.birthday ? formatDate(profile.birthday).split(' ')[0] : 'â€”'}</div>
                  )}
                </Field>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} style={primaryBtn}>
                      {saving ? 'Äang lÆ°u...' : 'LÆ°u thay Ä‘á»•i'}
                    </button>
                    <button onClick={() => setEditing(false)} style={secondaryBtn}>Há»§y</button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} style={primaryBtn}>
                    <PiPencilSimpleLineFill style={{ marginRight: 6, verticalAlign: -2 }} /> Chá»‰nh sá»­a
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===== POINTS ===== */}
          {activeTab === 'points' && (
            <div>
              <Card title="Äá»•i Ä‘iá»ƒm láº¥y voucher" icon={<PiGiftFill style={{ color: '#ec4899' }} />}>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px' }}>
                  Tá»· lá»‡ quy Ä‘á»•i: <strong>100 Ä‘iá»ƒm = 10.000Ä‘</strong>. Voucher cÃ³ háº¡n 60 ngÃ y.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {REDEEM_TIERS.map((t) => {
                    const enough = profile.loyaltyPoints >= t.points;
                    return (
                      <div key={t.points} style={{
                        padding: 16, border: `1px solid ${enough ? '#fbcfe8' : '#e5e7eb'}`,
                        background: enough ? '#fdf2f8' : '#f8fafc',
                        borderRadius: 10, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: enough ? '#be185d' : '#94a3b8' }}>
                          {t.points} Ä‘iá»ƒm
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', margin: '4px 0 12px' }}>
                          â†’ giáº£m {formatCurrency(t.value)}
                        </div>
                        <button
                          onClick={() => handleRedeem(t.points)}
                          disabled={!enough || redeemingPoints === t.points}
                          style={{
                            ...primaryBtn, width: '100%',
                            background: enough ? '#ec4899' : '#cbd5e1',
                            cursor: enough ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {redeemingPoints === t.points ? '...' : enough ? 'Äá»•i ngay' : 'ChÆ°a Ä‘á»§ Ä‘iá»ƒm'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <h3 style={{ margin: '32px 0 12px', fontSize: 16 }}>
                <PiClockClockwiseBold style={{ verticalAlign: -3, marginRight: 6 }} /> Lá»‹ch sá»­ Ä‘iá»ƒm
              </h3>
              {history.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>ChÆ°a cÃ³ lá»‹ch sá»­ giao dá»‹ch.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={th}>Thá»i gian</th>
                      <th style={th}>Loáº¡i</th>
                      <th style={th}>MÃ´ táº£</th>
                      <th style={{ ...th, textAlign: 'right' }}>Äiá»ƒm</th>
                      <th style={{ ...th, textAlign: 'right' }}>Sá»‘ dÆ°</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={td}>{formatDate(h.createdAt)}</td>
                        <td style={td}>
                          <span style={{
                            background: h.type === 'earn' ? '#dcfce7' : h.type === 'redeem' ? '#fef2f2' : '#fef3c7',
                            color: h.type === 'earn' ? '#166534' : h.type === 'redeem' ? '#991b1b' : '#92400e',
                            padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          }}>{h.type === 'earn' ? 'NHáº¬N' : h.type === 'redeem' ? 'Äá»”I' : h.type.toUpperCase()}</span>
                        </td>
                        <td style={td}>{h.description}</td>
                        <td style={{ ...td, textAlign: 'right', color: h.points > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                          {h.points > 0 ? '+' : ''}{h.points}
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}>{h.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ===== SECURITY ===== */}
          {activeTab === 'security' && <SecurityTab profile={profile} onReload={loadProfile} />}

          {/* ===== VOUCHERS ===== */}
          {activeTab === 'vouchers' && (
            <div>
              {vouchers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <PiTicketFill style={{ fontSize: 60, color: '#cbd5e1' }} />
                  <p style={{ color: '#64748b', marginTop: 16 }}>ChÆ°a cÃ³ voucher cÃ¡ nhÃ¢n nÃ o</p>
                  <button onClick={() => setActiveTab('points')} style={primaryBtn}>
                    Äá»•i Ä‘iá»ƒm láº¥y voucher
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {vouchers.map((v) => (
                    <div key={v.code} style={{
                      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                      border: '1px dashed #ec4899',
                      borderRadius: 10, padding: 16, position: 'relative',
                    }}>
                      <div style={{ fontSize: 12, color: '#be185d', fontWeight: 600 }}>VOUCHER CÃ NHÃ‚N</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626', margin: '6px 0' }}>
                        âˆ’{formatCurrency(v.value)}
                      </div>
                      <div style={{ fontSize: 12, color: '#475569' }}>
                        ÄÆ¡n tá»« {formatCurrency(v.minOrderAmount)} â€¢ Háº¿t háº¡n {formatDate(v.endDate).split(' ')[0]}
                      </div>
                      <div style={{
                        marginTop: 12, padding: '8px 12px', background: '#fff',
                        border: '1px dashed #f9a8d4', borderRadius: 6,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <code style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{v.code}</code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(v.code); toast.success('ÄÃ£ copy mÃ£'); }}
                          style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: 14 }}
                        >
                          <PiCopyBold />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ============ SECURITY TAB ============
function SecurityTab({ profile, onReload }: { profile: AccountDTO; onReload: () => void }) {
  const [setupQr, setSetupQr] = useState<{ secret: string; otpAuthUri: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [busy, setBusy] = useState(false);

  type ActivityRow = { id: number; provider: string; ip?: string; browser?: string; os?: string; deviceType?: string; success: boolean; failReason?: string; createdAt: string };
  const [activities, setActivities] = useState<ActivityRow[]>([]);

  useEffect(() => {
    void authApi.getMyActivity().then((r) => {
      if (r.success && r.data) setActivities(r.data);
    });
  }, []);

  const handleStartSetup = async () => {
    setBusy(true);
    const r = await authApi.setup2Fa();
    setBusy(false);
    if (r.success && r.data) setSetupQr(r.data);
    else toast.error(r.error || 'KhÃ´ng setup Ä‘Æ°á»£c 2FA');
  };

  const handleEnable2Fa = async () => {
    if (twoFaCode.length !== 6) {
      toast.error('Nháº­p Ä‘á»§ 6 sá»‘');
      return;
    }
    setBusy(true);
    const r = await authApi.enable2Fa(twoFaCode);
    setBusy(false);
    if (r.success) {
      toast.success(r.data?.message || 'ÄÃ£ báº­t 2FA');
      setSetupQr(null);
      setTwoFaCode('');
      onReload();
    } else {
      toast.error(r.error || 'MÃ£ khÃ´ng Ä‘Ãºng');
    }
  };

  const handleDisable2Fa = async () => {
    const code = prompt('Nháº­p mÃ£ 6 sá»‘ tá»« Authenticator Ä‘á»ƒ xÃ¡c nháº­n táº¯t 2FA:');
    if (!code) return;
    const r = await authApi.disable2Fa(code);
    if (r.success) {
      toast.success('ÄÃ£ táº¯t 2FA');
      onReload();
    } else {
      toast.error(r.error || 'MÃ£ khÃ´ng Ä‘Ãºng');
    }
  };

  const handleSendVerify = async () => {
    const r = await authApi.sendVerifyEmail();
    if (r.success) toast.success(r.data?.message || 'ÄÃ£ gá»­i email');
    else toast.error(r.error || 'Lá»—i');
  };

  // QR code: dÃ¹ng api.qrserver.com (free, khÃ´ng cáº§n install lib)
  const qrUrl = setupQr ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupQr.otpAuthUri)}` : '';

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Email verify */}
      <Card title="XÃ¡c thá»±c Email" icon={<PiShieldCheckBold style={{ color: '#16a34a' }} />}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{profile.email}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Tráº¡ng thÃ¡i: <strong style={{ color: '#16a34a' }}>ÄÃ£ xÃ¡c thá»±c</strong>
            </div>
          </div>
          <button onClick={handleSendVerify} style={secondaryBtn}>
            Gá»­i láº¡i email xÃ¡c thá»±c
          </button>
        </div>
      </Card>

      {/* Đổi mật khẩu */}
      <Card title="Đổi mật khẩu" icon={<PiShieldCheckBold style={{ color: '#0ea5e9' }} />}>
        <ChangePasswordForm />
      </Card>
      {/* 2FA */}
      <Card title="XÃ¡c thá»±c 2 yáº¿u tá»‘ (2FA)" icon={<PiQrCodeBold style={{ color: '#6366f1' }} />}>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
          Báº£o vá»‡ tÃ i khoáº£n vá»›i mÃ£ 6 sá»‘ tá»« Google Authenticator / Authy / Microsoft Authenticator.
        </p>

        {!setupQr ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
              background: '#fef3c7', color: '#92400e',
            }}>
              CHÆ¯A Báº¬T
            </span>
            <button onClick={handleStartSetup} disabled={busy} style={primaryBtn}>
              {busy ? 'Äang táº£i...' : 'Báº­t 2FA ngay'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ background: '#fff', padding: 8, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <img src={qrUrl} alt="QR 2FA" style={{ width: '100%', height: 'auto' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>BÆ°á»›c 1: QuÃ©t QR báº±ng app Authenticator</h4>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                Hoáº·c nháº­p tay secret nÃ y:
              </p>
              <code style={{
                display: 'block', padding: '8px 12px', background: '#f1f5f9',
                borderRadius: 6, fontSize: 13, fontFamily: 'monospace',
                marginBottom: 16, wordBreak: 'break-all',
              }}>{setupQr.secret}</code>

              <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>BÆ°á»›c 2: Nháº­p mÃ£ 6 sá»‘ Ä‘ang hiá»‡n trong app</h4>
              <input
                type="text"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                style={{
                  width: 200, padding: '12px 14px', fontSize: 18, fontWeight: 700,
                  letterSpacing: 4, textAlign: 'center', border: '1.5px solid #e5e7eb',
                  borderRadius: 8, marginBottom: 12, fontFamily: 'monospace',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleEnable2Fa} disabled={busy || twoFaCode.length !== 6} style={primaryBtn}>
                  XÃ¡c nháº­n báº­t 2FA
                </button>
                <button onClick={() => { setSetupQr(null); setTwoFaCode(''); }} style={secondaryBtn}>
                  Há»§y
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Activity log */}
      <Card title="Lá»‹ch sá»­ Ä‘Äƒng nháº­p" icon={<PiClockHistory style={{ color: '#ec4899' }} />}>
        {activities.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>ChÆ°a cÃ³ lá»‹ch sá»­ Ä‘Äƒng nháº­p.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={th}>Thá»i gian</th>
                <th style={th}>PhÆ°Æ¡ng thá»©c</th>
                <th style={th}>Thiáº¿t bá»‹</th>
                <th style={th}>IP</th>
                <th style={th}>Tráº¡ng thÃ¡i</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={td}>{formatDate(a.createdAt)}</td>
                  <td style={td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: '#e0e7ff', color: '#4338ca',
                    }}>{a.provider}</span>
                  </td>
                  <td style={td}>{a.browser} / {a.os}</td>
                  <td style={td}>{a.ip || 'â€”'}</td>
                  <td style={td}>
                    {a.success ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        <i className="fa fa-check-circle"></i> ThÃ nh cÃ´ng
                      </span>
                    ) : (
                      <span style={{ color: '#dc2626' }} title={a.failReason}>
                        <i className="fa fa-times-circle"></i> Tháº¥t báº¡i
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {/* Hủy tài khoản */}
      <Card title="Hủy tài khoản" icon={<PiSignOut style={{ color: '#dc2626' }} />}>
        <DeleteAccountSection />
      </Card>
    </div>
  );
}

// ---------- ChangePassword form ----------
function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.error('Mật khẩu mới cần tối thiểu 8 ký tự');
    if (next !== confirm) return toast.error('Xác nhận mật khẩu không khớp');
    setBusy(true);
    const r = await accountApi.changePassword({ currentPassword: current, newPassword: next });
    setBusy(false);
    if (r.success) {
      toast.success(r.data?.message || 'Đã đổi mật khẩu');
      setCurrent(''); setNext(''); setConfirm('');
    } else {
      toast.error(r.error || 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
      <Field label="Mật khẩu hiện tại" icon={<PiShieldCheckBold />}>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} style={inputStyle} autoComplete="current-password" />
      </Field>
      <Field label="Mật khẩu mới (≥ 8 ký tự)" icon={<PiShieldCheckBold />}>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} style={inputStyle} autoComplete="new-password" />
      </Field>
      <Field label="Nhập lại mật khẩu mới" icon={<PiShieldCheckBold />}>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} autoComplete="new-password" />
      </Field>
      <button type="submit" disabled={busy || !current || !next} style={{ ...primaryBtn, justifySelf: 'start', marginTop: 4 }}>
        {busy ? 'Đang đổi...' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}

// ---------- Delete account section ----------
function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (confirm.trim().toUpperCase() !== 'DELETE') {
      toast.error('Vui lòng gõ đúng "DELETE" để xác nhận');
      return;
    }
    setBusy(true);
    const r = await accountApi.deleteAccount(confirm);
    setBusy(false);
    if (r.success) {
      toast.success(r.data?.message || 'Đã hủy tài khoản');
      // Logout & redirect home
      authApi.logout();
      window.location.href = '/';
    } else {
      toast.error(r.error || 'Hủy tài khoản thất bại');
    }
  };

  if (!open) {
    return (
      <div>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
          Hành động này sẽ ẩn danh hóa toàn bộ thông tin cá nhân (tên, email, SĐT, avatar, ngày sinh) theo GDPR.
          Đơn hàng đã đặt sẽ được giữ lại cho mục đích kế toán nhưng không liên kết tới bạn nữa.
          <br />
          <strong style={{ color: '#dc2626' }}>Không thể hoàn tác.</strong>
        </p>
        <button onClick={() => setOpen(true)} style={{
          padding: '10px 18px', background: '#fef2f2', color: '#dc2626',
          border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
        }}>Tôi muốn hủy tài khoản</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
      <p style={{ fontSize: 13, color: '#7f1d1d', margin: '0 0 8px' }}>
        Gõ <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>DELETE</code> rồi bấm xác nhận:
      </p>
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="DELETE"
        style={{ ...inputStyle, marginBottom: 10, borderColor: '#fecaca' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleDelete} disabled={busy} style={{
          padding: '10px 18px', background: '#dc2626', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
        }}>
          {busy ? 'Đang hủy...' : 'Xác nhận hủy tài khoản'}
        </button>
        <button onClick={() => { setOpen(false); setConfirm(''); }} style={secondaryBtn}>
          Quay lại
        </button>
      </div>
    </div>
  );
}

// ============ HELPERS ============
function StatCard({ icon, value, label, color, hint, isText }: { icon: React.ReactNode; value: string | number; label: string; color: string; hint?: string; isText?: boolean }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: 16, display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}1a`, color, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: isText ? 16 : 22, fontWeight: 700, color: '#0f172a' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{label}{hint && ` â€¢ ${hint}`}</div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1',
  borderRadius: 6, fontSize: 14,
};
const readonly: React.CSSProperties = { padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 14, color: '#0f172a' };
const primaryBtn: React.CSSProperties = {
  padding: '10px 18px', background: '#ec4899', color: '#fff', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
};
const secondaryBtn: React.CSSProperties = {
  padding: '10px 18px', background: '#f1f5f9', color: '#0f172a',
  border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 13,
};
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 };
const td: React.CSSProperties = { padding: '10px 12px', color: '#0f172a', verticalAlign: 'top' };
