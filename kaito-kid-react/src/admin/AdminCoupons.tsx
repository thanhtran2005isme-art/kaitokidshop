import { useEffect, useMemo, useState } from 'react';
import { useAdminUi } from '../components/admin/AdminUiProvider';
import { formatCurrency } from '../utils/format';
import {
  calculateCouponDiscount,
  getCouponStatus,
  readStoredCoupons,
  saveStoredCoupons,
  type Coupon,
  type CouponDiscountType,
} from '../utils/marketingConfig';
import AdminIcon from '../components/admin/AdminIcon';


interface CouponFormState {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrder: number;
  quantity: number;
  used: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused';
  isPublic: boolean;
}

const DEFAULT_FORM: CouponFormState = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: 10,
  maxDiscount: 0,
  minOrder: 0,
  quantity: 100,
  used: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  status: 'active',
  isPublic: true,
};

const STATUS_LABELS = {
  active: 'Dang hoạt động',
  scheduled: 'Sắp áp dụng',
  exhausted: 'Het luot',
  expired: 'Het han',
  paused: 'Tạm dừng',
} as const;

function formatDate(value: string): string {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

export default function AdminCoupons() {
  const { confirm } = useAdminUi();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | keyof typeof STATUS_LABELS>('all');
  const [form, setForm] = useState<CouponFormState>(DEFAULT_FORM);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCoupons(readStoredCoupons());
  }, []);

  const filteredCoupons = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

    return coupons
      .filter((coupon) => {
        const computedStatus = getCouponStatus(coupon);
        const matchesSearch = !normalizedSearch
          || coupon.code.toLocaleLowerCase().includes(normalizedSearch)
          || coupon.description.toLocaleLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === 'all' || computedStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => new Date(left.endDate).getTime() - new Date(right.endDate).getTime());
  }, [coupons, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    active: coupons.filter((coupon) => getCouponStatus(coupon) === 'active').length,
    scheduled: coupons.filter((coupon) => getCouponStatus(coupon) === 'scheduled').length,
    exhausted: coupons.filter((coupon) => getCouponStatus(coupon) === 'exhausted').length,
    expired: coupons.filter((coupon) => getCouponStatus(coupon) === 'expired').length,
  }), [coupons]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditId(null);
    setError('');
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrder: coupon.minOrder,
      quantity: coupon.quantity,
      used: coupon.used,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      status: coupon.status === 'paused' ? 'paused' : 'active',
      isPublic: coupon.isPublic,
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const persistCoupons = (nextCoupons: Coupon[], message: string) => {
    const saved = saveStoredCoupons(nextCoupons);
    setCoupons(saved);
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.endDate) {
      setError('Cần nhập ma coupon và ngay het han.');
      return;
    }

    if (new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      setError('Ngày hết hạn phải sau ngày bắt đầu.');
      return;
    }

    const normalizedCode = form.code.trim().toUpperCase();
    const duplicateCode = coupons.find((coupon) => coupon.code === normalizedCode && coupon.id !== editId);

    if (duplicateCode) {
      setError('Ma coupon này đã tồn tại.');
      return;
    }

    const now = new Date().toISOString();
    const nextCoupon: Coupon = {
      id: editId || Date.now(),
      code: normalizedCode,
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Math.max(0, form.discountValue),
      maxDiscount: form.discountType === 'percent' && (form.maxDiscount || 0) > 0 ? form.maxDiscount : undefined,
      minOrder: Math.max(0, form.minOrder),
      quantity: Math.max(0, form.quantity),
      used: Math.min(Math.max(0, form.used), Math.max(0, form.quantity)),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      isPublic: form.isPublic,
      createdAt: editId ? coupons.find((coupon) => coupon.id === editId)?.createdAt || now : now,
      updatedAt: now,
    };

    const nextCoupons = editId
      ? coupons.map((coupon) => coupon.id === editId ? nextCoupon : coupon)
      : [...coupons, nextCoupon];

    persistCoupons(nextCoupons, editId ? 'Đã cập nhật coupon.' : 'Đã tạo coupon mới.');
    closeForm();
  };

  const handleDelete = async (couponId: number) => {
    const selectedCoupon = coupons.find((coupon) => coupon.id === couponId);

    if (!selectedCoupon) {
      return;
    }

    const accepted = await confirm({
      title: 'Xóa ma giảm giá',
      message: `Ma ${selectedCoupon.code} sẽ bị gỡ khỏi hệ thống coupon hiện tại.`,
      confirmLabel: 'Xóa coupon',
      tone: 'danger',
      icon: 'fa-ticket',
    });

    if (!accepted) {
      return;
    }

    persistCoupons(
      coupons.filter((coupon) => coupon.id !== couponId),
      'Đã xóa coupon.',
    );
  };

  const togglePausedState = (couponId: number) => {
    const nextCoupons: Coupon[] = coupons.map((coupon) =>
      coupon.id === couponId
        ? {
            ...coupon,
            status: (coupon.status === 'paused' ? 'active' : 'paused') as Coupon['status'],
            updatedAt: new Date().toISOString(),
          }
        : coupon,
    );

    persistCoupons(nextCoupons, 'Đã cập nhật trạng thái coupon.');
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setFeedback(`Đã copy mã ${code}.`);
      window.setTimeout(() => setFeedback(''), 2000);
    } catch {
      setFeedback('Không the copy ma trên trinh duyet hiện tại.');
      window.setTimeout(() => setFeedback(''), 2000);
    }
  };

  const previewDiscount = useMemo(() => (
    calculateCouponDiscount({
      id: editId || 0,
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: form.discountValue,
      maxDiscount: form.maxDiscount,
      minOrder: form.minOrder,
      quantity: form.quantity,
      used: form.used,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      isPublic: form.isPublic,
      createdAt: new Date().toISOString(),
    }, 800000)
  ), [editId, form]);

  const previewCoupon: Coupon = useMemo(() => ({
    id: editId || 0,
    code: form.code,
    description: form.description,
    discountType: form.discountType,
    discountValue: form.discountValue,
    maxDiscount: form.maxDiscount,
    minOrder: form.minOrder,
    quantity: form.quantity,
    used: form.used,
    startDate: form.startDate,
    endDate: form.endDate,
    status: form.status,
    isPublic: form.isPublic,
    createdAt: new Date().toISOString(),
  }), [editId, form]);

  const previewCouponStatus = getCouponStatus(previewCoupon);

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div>
          <h1>Ma giảm giá</h1>
          <p className="marketing-page-subtitle">Theo dõi tiến độ sử dụng, lọc theo trạng thái và tạm dừng nhanh mã coupon khi cần.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <AdminIcon name="fa fa-plus" /> Thêm ma
          </button>
        </div>
      </div>

      {feedback ? (
        <div className="alert alert-success marketing-feedback">
          <AdminIcon name="fa fa-check-circle" /> {feedback}
        </div>
      ) : null}

      <div className="stats-grid-small">
        <div className="stat-card-small">
          <div className="stat-icon-small completed">
            <AdminIcon name="fa fa-ticket" />
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Dang hoạt động</span>
            <h3 className="stat-value-small">{stats.active}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small shipping">
            <AdminIcon name="fa fa-hourglass-half" />
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Sắp áp dụng</span>
            <h3 className="stat-value-small">{stats.scheduled}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small pending">
            <AdminIcon name="fa fa-ban" />
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Het luot</span>
            <h3 className="stat-value-small">{stats.exhausted}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small cancelled">
            <AdminIcon name="fa fa-clock" />
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Het han</span>
            <h3 className="stat-value-small">{stats.expired}</h3>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="filters-bar marketing-filters">
          <input
            className="search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tim theo ma coupon hoặc mô tả..."
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Dang hoạt động</option>
            <option value="scheduled">Sắp áp dụng</option>
            <option value="paused">Tạm dừng</option>
            <option value="exhausted">Het luot</option>
            <option value="expired">Het han</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Coupon</th>
                <th className="marketing-col-value">Giá trị</th>
                <th className="marketing-col-progress">Tiến độ sử dụng</th>
                <th className="marketing-col-status">Trạng thái</th>
                <th className="marketing-col-dates">Hieu luc</th>
                <th className="marketing-col-actions">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="loading-row">Chưa có coupon phù hợp bộ lọc.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const computedStatus = getCouponStatus(coupon);
                  const usagePercent = coupon.quantity > 0 ? Math.min(100, Math.round(coupon.used / coupon.quantity * 100)) : 0;

                  return (
                    <tr key={coupon.id}>
                      <td>
                        <div className="marketing-code-cell">
                          <strong>{coupon.code}</strong>
                          <span>{coupon.description || 'Không có mô tả'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="marketing-value-cell">
                          <strong>{coupon.discountType === 'percent' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}</strong>
                          <span>Don tối thiểu: {coupon.minOrder > 0 ? formatCurrency(coupon.minOrder) : 'Không gioi han'}</span>
                          {coupon.discountType === 'percent' && coupon.maxDiscount ? (
                            <span>Trần giảm: {formatCurrency(coupon.maxDiscount)}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="marketing-progress-cell">
                          <div className="marketing-progress-bar">
                            <progress className="marketing-progress-track" value={usagePercent} max={100} />
                          </div>
                          <strong>{coupon.used}/{coupon.quantity}</strong>
                          <span>{usagePercent}% đã dùng</span>
                        </div>
                      </td>
                      <td>
                        <span className={`marketing-status-pill ${computedStatus}`}>{STATUS_LABELS[computedStatus]}</span>
                      </td>
                      <td>
                        <div className="marketing-date-stack">
                          <strong>{formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</strong>
                          <span>{coupon.isPublic ? 'Công khai' : 'Nội bộ'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="marketing-row-actions">
                          <button className="btn-action view" onClick={() => handleCopyCode(coupon.code)} title="Copy mã">
                            <AdminIcon name="fa fa-copy" />
                          </button>
                          <button className="btn-action btn-edit" onClick={() => openEdit(coupon)} title="Chỉnh sửa">
                            <AdminIcon name="fa fa-pen" />
                          </button>
                          <button className="btn-action" onClick={() => togglePausedState(coupon.id)} title="Tạm dừng / tiếp tục">
                            <AdminIcon name={coupon.status === 'paused' ? 'fa-play' : 'fa-pause'} />
                          </button>
                          <button className="btn-action btn-delete" onClick={() => handleDelete(coupon.id)} title="Xóa">
                            <AdminIcon name="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm ? (
        <div className="modal active" onClick={closeForm}>
          <div className="modal-dialog marketing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Cập nhật coupon' : 'Thêm ma giảm giá'}</h3>
                <button className="modal-close" onClick={closeForm}>
                  <AdminIcon name="fa fa-times" />
                </button>
              </div>

              <div className="modal-body marketing-modal-body single-column">
                <div className="marketing-form-column">
                  {error ? (
                    <div className="alert alert-danger">
                      <AdminIcon name="fa fa-circle-exclamation" /> {error}
                    </div>
                  ) : null}

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required">Ma coupon</label>
                      <input
                        className="form-control"
                        value={form.code}
                        onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                        placeholder="SUMMER25"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Trạng thái nội bộ</label>
                      <select
                        className="form-control"
                        value={form.status}
                        onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as 'active' | 'paused' }))}
                      >
                        <option value="active">Dang bat</option>
                        <option value="paused">Tạm dừng</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <input
                      className="form-control"
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Giảm giá cho đơn hàng online"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Loai giảm giá</label>
                      <select
                        className="form-control"
                        value={form.discountType}
                        onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value as CouponDiscountType }))}
                      >
                        <option value="percent">Phan tram</option>
                        <option value="fixed">So tien có dinh</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Giá trị</label>
                      <input
                        className="form-control"
                        type="number"
                        min={0}
                        value={form.discountValue}
                        onChange={(event) => setForm((current) => ({ ...current, discountValue: Number(event.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  {form.discountType === 'percent' ? (
                    <div className="form-group">
                      <label className="form-label">Trần giảm tối đa</label>
                      <input
                        className="form-control"
                        type="number"
                        min={0}
                        value={form.maxDiscount || 0}
                        onChange={(event) => setForm((current) => ({ ...current, maxDiscount: Number(event.target.value) || 0 }))}
                        placeholder="0 = không gioi han"
                      />
                    </div>
                  ) : null}

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Don tối thiểu</label>
                      <input
                        className="form-control"
                        type="number"
                        min={0}
                        value={form.minOrder}
                        onChange={(event) => setForm((current) => ({ ...current, minOrder: Number(event.target.value) || 0 }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tong luot sử dụng</label>
                      <input
                        className="form-control"
                        type="number"
                        min={0}
                        value={form.quantity}
                        onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Da sử dụng</label>
                      <input
                        className="form-control"
                        type="number"
                        min={0}
                        value={form.used}
                        onChange={(event) => setForm((current) => ({ ...current, used: Number(event.target.value) || 0 }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hiển thị công khai</label>
                      <label className="form-check marketing-inline-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.isPublic}
                          onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))}
                        />
                        <span className="form-check-label">Cho phép hiển thị trong danh sách ưu đãi</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Bắt đầu</label>
                      <input
                        className="form-control"
                        type="date"
                        value={form.startDate}
                        onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Ket thuc</label>
                      <input
                        className="form-control"
                        type="date"
                        value={form.endDate}
                        onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="marketing-preview-card">
                    <span className={`marketing-status-pill ${previewCouponStatus}`}>{STATUS_LABELS[previewCouponStatus]}</span>
                    <h3>{form.code || 'MA-COUPON'}</h3>
                    <p>{form.description || 'Mô tả coupon sẽ hiển thị ở đây.'}</p>
                    <div className="marketing-preview-discount">
                      {form.discountType === 'percent' ? `${form.discountValue}%` : formatCurrency(form.discountValue)}
                    </div>
                    <ul className="marketing-preview-list">
                      <li>Don tối thiểu: {form.minOrder > 0 ? formatCurrency(form.minOrder) : 'Không gioi han'}</li>
                      <li>Mẫu tính trên đơn 800.000đ: giảm {formatCurrency(previewDiscount)}</li>
                      <li>Tiến độ: {Math.min(form.used, form.quantity)}/{form.quantity}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeForm}>Động</button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <AdminIcon name="fa fa-save" /> Lưu coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
