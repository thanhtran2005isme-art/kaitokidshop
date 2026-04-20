import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminIcon from '../components/admin/AdminIcon';
import { inventoryApi } from '../services/api';
import {
  INVENTORY_UPDATED_EVENT,
  inventoryService,
  type InventoryAlertSettings,
} from '../services/inventoryService';
import type { Product } from '../types';

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

type StockLevel = 'out' | 'low' | 'watch' | 'stable';
type StockFilter = 'all' | StockLevel | 'direct' | 'variant';

function formatDateTime(value?: string): string {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStockLevel(stock: number, settings: InventoryAlertSettings): StockLevel {
  if (stock <= 0) return 'out';
  if (stock <= settings.criticalThreshold) return 'low';
  if (stock <= settings.watchThreshold) return 'watch';
  return 'stable';
}

function getStockBadge(stock: number, settings: InventoryAlertSettings): { label: string; className: StockLevel } {
  const level = getStockLevel(stock, settings);

  switch (level) {
    case 'out':
      return { label: 'Hết hàng', className: level };
    case 'low':
      return { label: 'Sắp hết', className: level };
    case 'watch':
      return { label: 'Cần theo dõi', className: level };
    default:
      return { label: 'Ổn định', className: level };
  }
}

function getStockProgress(stock: number, settings: InventoryAlertSettings): number {
  const maxVisual = Math.max(settings.watchThreshold * 2, settings.criticalThreshold + 1, 20);
  return Math.min((Math.max(stock, 0) / maxVisual) * 100, 100);
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [restockNote, setRestockNote] = useState('');
  const [exportQuantity, setExportQuantity] = useState(1);
  const [exportNote, setExportNote] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [bulkNote, setBulkNote] = useState('');
  const [alertSettings, setAlertSettings] = useState<InventoryAlertSettings>(
    inventoryService.getAlertSettings(),
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    setAlertSettings(inventoryService.getAlertSettings());

    const result = await inventoryApi.getAll();
    if (result.success && result.data) {
      setProducts(result.data);
    } else {
      setToast({
        type: 'error',
        message: result.error || 'Không thể tải danh sách tồn kho từ backend.',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadInventory();

    const handleInventoryUpdated = () => void loadInventory();
    window.addEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdated);

    return () => {
      window.removeEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdated);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const inventoryProfiles = useMemo(
    () =>
      new Map(
        products.map((product) => [product.id, inventoryService.getStockControlProfile(product)]),
      ),
    [products],
  );

  useEffect(() => {
    setSelectedIds((current) => {
      const next = current.filter((id) => inventoryProfiles.get(id)?.canManageDirectly);
      return next.length === current.length ? current : next;
    });
  }, [inventoryProfiles]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const profile = inventoryProfiles.get(product.id);
      if (!profile) return false;

      const searchableFields = [
        product.name,
        product.sku,
        product.category,
        product.gender,
        product.subcategory,
      ].filter((field): field is string => typeof field === 'string' && field.length > 0);

      const matchesKeyword =
        !keyword ||
        searchableFields.some((field) => field.toLowerCase().includes(keyword));

      const matchesFilter =
        stockFilter === 'all'
          ? true
          : stockFilter === 'direct'
            ? profile.canManageDirectly
            : stockFilter === 'variant'
              ? !profile.canManageDirectly
              : getStockLevel(product.stock, alertSettings) === stockFilter;

      return matchesKeyword && matchesFilter;
    });
  }, [alertSettings, inventoryProfiles, products, search, stockFilter]);

  const stockSummary = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const outOfStock = products.filter((product) => getStockLevel(product.stock, alertSettings) === 'out').length;
    const lowStock = products.filter((product) => getStockLevel(product.stock, alertSettings) === 'low').length;
    const watchList = products.filter((product) => getStockLevel(product.stock, alertSettings) === 'watch').length;
    const directCount = products.filter((product) => inventoryProfiles.get(product.id)?.canManageDirectly).length;
    const variantCount = products.filter((product) => inventoryProfiles.get(product.id)?.mode === 'variant').length;

    return {
      totalStock,
      outOfStock,
      lowStock,
      watchList,
      directCount,
      restrictedCount: variantCount,
    };
  }, [alertSettings, inventoryProfiles, products]);

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.includes(product.id)),
    [products, selectedIds],
  );

  const visibleSelectableProducts = useMemo(
    () => filteredProducts.filter((product) => inventoryProfiles.get(product.id)?.canManageDirectly),
    [filteredProducts, inventoryProfiles],
  );

  const selectedCount = selectedIds.length;
  const visibleRestrictedCount = filteredProducts.length - visibleSelectableProducts.length;
  const allVisibleSelected =
    visibleSelectableProducts.length > 0 &&
    visibleSelectableProducts.every((product) => selectedIds.includes(product.id));

  const activeProductProfile = useMemo(() => {
    if (!activeProduct) return null;
    return inventoryProfiles.get(activeProduct.id) || inventoryService.getStockControlProfile(activeProduct);
  }, [activeProduct, inventoryProfiles]);

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(visibleSelectableProducts.map((product) => product.id));
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...visibleSelectableProducts.map((product) => product.id)])),
    );
  };

  const toggleSelection = (productId: number) => {
    const product = products.find((entry) => entry.id === productId);
    const profile = product ? inventoryProfiles.get(product.id) : null;

    if (!profile?.canManageDirectly) {
      setToast({
        type: 'error',
        message: profile?.note || 'Sản phẩm này cần quản lý tồn kho theo màu / size, không thể chọn nhập trực tiếp.',
      });
      return;
    }

    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const openRestockModal = (product: Product) => {
    const profile = inventoryProfiles.get(product.id) || inventoryService.getStockControlProfile(product);

    if (!profile.canManageDirectly) {
      setToast({
        type: 'error',
        message: profile.note,
      });
      return;
    }

    setActiveProduct(product);
    setRestockQuantity(Math.max(alertSettings.watchThreshold - product.stock, 1));
    setRestockNote(`Phiếu nhập bổ sung cho ${product.name}`);
    setShowRestockModal(true);
  };

  const closeRestockModal = () => {
    setActiveProduct(null);
    setRestockQuantity(10);
    setRestockNote('');
    setShowRestockModal(false);
  };

  const openExportModal = (product: Product) => {
    const profile = inventoryProfiles.get(product.id) || inventoryService.getStockControlProfile(product);

    if (!profile.canManageDirectly) {
      setToast({ type: 'error', message: profile.note });
      return;
    }

    setActiveProduct(product);
    setExportQuantity(1);
    setExportNote(`Phiếu xuất cho ${product.name}`);
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setActiveProduct(null);
    setExportQuantity(1);
    setExportNote('');
    setShowExportModal(false);
  };

  const handleExportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeProduct || !activeProductProfile?.canManageDirectly) {
      setToast({
        type: 'error',
        message: activeProductProfile?.note || 'Sản phẩm này không thể xuất trực tiếp trên trang tồn kho.',
      });
      return;
    }

    if (exportQuantity <= 0) {
      setToast({ type: 'error', message: 'Số lượng xuất phải lớn hơn 0.' });
      return;
    }

    if (exportQuantity > activeProduct.stock) {
      setToast({
        type: 'error',
        message: `Không đủ tồn kho. Hiện có ${activeProduct.stock}, yêu cầu xuất ${exportQuantity}.`,
      });
      return;
    }

    const result = await inventoryApi.adjust({
      sanPhamId: activeProduct.id,
      soLuong: exportQuantity,
      loaiThayDoi: 'export',
      ghiChu: exportNote.trim() || `Phiếu xuất cho ${activeProduct.name}`,
    });

    if (!result.success || !result.data) {
      setToast({ type: 'error', message: result.error || 'Không thể xuất kho. Kiểm tra lại số lượng tồn.' });
      return;
    }

    setToast({
      type: 'success',
      message: `Đã ghi nhận xuất ${exportQuantity} sản phẩm cho ${activeProduct.name}.`,
    });
    closeExportModal();
    await loadInventory();
  };

  const handleRestockSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeProduct || !activeProductProfile?.canManageDirectly) {
      setToast({
        type: 'error',
        message: activeProductProfile?.note || 'Sản phẩm này không thể nhập trực tiếp trên trang tồn kho.',
      });
      return;
    }

    if (restockQuantity <= 0) {
      setToast({
        type: 'error',
        message: 'Số lượng nhập phải lớn hơn 0.',
      });
      return;
    }

    const result = await inventoryApi.adjust({
      sanPhamId: activeProduct.id,
      soLuong: restockQuantity,
      loaiThayDoi: 'import',
      ghiChu: restockNote.trim() || `Phiếu nhập bổ sung cho ${activeProduct.name}`,
    });

    if (!result.success || !result.data) {
      setToast({
        type: 'error',
        message: result.error || activeProductProfile.note,
      });
      return;
    }

    setToast({
      type: 'success',
      message: `Đã ghi nhận nhập ${restockQuantity} sản phẩm cho ${activeProduct.name}.`,
    });
    closeRestockModal();
    await loadInventory();
  };

  const openBulkModal = () => {
    if (selectedCount === 0) {
      setToast({
        type: 'error',
        message: 'Hãy chọn ít nhất một sản phẩm đủ điều kiện nhập trực tiếp.',
      });
      return;
    }

    setBulkQuantity(10);
    setBulkNote(`Phiếu nhập nhanh cho ${selectedCount} sản phẩm`);
    setShowBulkModal(true);
  };

  const closeBulkModal = () => {
    setBulkQuantity(10);
    setBulkNote('');
    setShowBulkModal(false);
  };

  const handleBulkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedCount === 0) {
      setToast({
        type: 'error',
        message: 'Hãy chọn ít nhất một sản phẩm đủ điều kiện nhập trực tiếp.',
      });
      return;
    }

    if (bulkQuantity <= 0) {
      setToast({
        type: 'error',
        message: 'Số lượng nhập phải lớn hơn 0.',
      });
      return;
    }

    const note = bulkNote.trim() || `Phiếu nhập nhanh cho ${selectedCount} sản phẩm`;
    const results = await Promise.all(
      selectedProducts.map((product) =>
        inventoryApi.adjust({
          sanPhamId: product.id,
          soLuong: bulkQuantity,
          loaiThayDoi: 'import',
          ghiChu: note,
        }),
      ),
    );
    const successfulResults = results.filter((result) => result.success);

    if (successfulResults.length === 0) {
      setToast({
        type: 'error',
        message: results.find((result) => result.error)?.error || 'Không có sản phẩm nào được cập nhật. Hãy kiểm tra lại mô hình tồn kho của sản phẩm.',
      });
      return;
    }

    setToast({
      type: 'success',
      message: `Đã ghi nhận phiếu nhập cho ${successfulResults.length} sản phẩm đủ điều kiện.`,
    });
    setSelectedIds([]);
    closeBulkModal();
    await loadInventory();
  };

  return (
    <div className="inventory-shell inventory-ops-page">
      <section className="inventory-ops-hero">
        <div className="inventory-ops-hero-copy">
          <span className="inventory-ops-overline">Inventory policy</span>
          <h1>Quản lý tồn kho</h1>
          <p>
            Trang này ghi nhận phiếu nhập và phiếu xuất cho tất cả sản phẩm. Tồn kho được quản lý theo tổng.
            Mọi thao tác đều được ghi lịch sử đầy đủ.
          </p>
        </div>

        <div className="inventory-ops-hero-actions">
          <Link to="/admin/inventory/history" className="inventory-ops-link">
            <AdminIcon name="fa-history" />
            <span>Lịch sử nhập / xuất</span>
          </Link>
          <Link to="/admin/inventory/alerts" className="inventory-ops-link is-outline">
            <AdminIcon name="fa-exclamation-triangle" />
            <span>Cảnh báo tồn kho</span>
          </Link>
        </div>

        <div className="inventory-ops-threshold-card">
          <span className="inventory-ops-overline">Ngưỡng cảnh báo</span>
          <strong>Sắp hết ≤ {alertSettings.criticalThreshold} • Cần theo dõi ≤ {alertSettings.watchThreshold}</strong>
          <p>
            Sản phẩm nhiều biến thể vẫn nhập/xuất theo tồn tổng. Cảnh báo dựa trên tồn tổng để phát hiện rủi ro nhanh.
          </p>
        </div>
      </section>

      <section className="inventory-ops-kpi-grid">
        <article className="inventory-ops-kpi-card">
          <div className="inventory-ops-kpi-icon"><AdminIcon name="fa-boxes" /></div>
          <div><span>Tổng sản phẩm</span><strong>{products.length}</strong></div>
        </article>
        <article className="inventory-ops-kpi-card">
          <div className="inventory-ops-kpi-icon is-positive"><AdminIcon name="fa-cubes" /></div>
          <div><span>Tổng đơn vị tồn</span><strong>{stockSummary.totalStock}</strong></div>
        </article>
        <article className="inventory-ops-kpi-card">
          <div className="inventory-ops-kpi-icon is-neutral"><AdminIcon name="fa-cube" /></div>
          <div><span>Nhập trực tiếp được</span><strong>{stockSummary.directCount}</strong></div>
        </article>
        <article className="inventory-ops-kpi-card">
          <div className="inventory-ops-kpi-icon is-warning"><AdminIcon name="fa-layer-group" /></div>
          <div><span>Nhiều biến thể</span><strong>{stockSummary.restrictedCount}</strong></div>
        </article>
        <article className="inventory-ops-kpi-card">
          <div className="inventory-ops-kpi-icon is-danger"><AdminIcon name="fa-times-circle" /></div>
          <div><span>Hết hàng / sắp hết</span><strong>{stockSummary.outOfStock + stockSummary.lowStock}</strong></div>
        </article>
      </section>

      {(stockSummary.outOfStock > 0 || stockSummary.lowStock > 0 || stockSummary.watchList > 0 || stockSummary.restrictedCount > 0) && (
        <section className="inventory-ops-warning-strip">
          <AdminIcon name="fa-exclamation-triangle" />
          <span>
            {stockSummary.outOfStock} hết hàng, {stockSummary.lowStock} sắp hết, {stockSummary.watchList} cần
            theo dõi và {stockSummary.restrictedCount} sản phẩm đang quản lý tồn theo tổng (nhiều biến thể).
          </span>
        </section>
      )}

      <section className="inventory-ops-workspace">
        <header className="inventory-ops-toolbar">
          <div className="inventory-ops-search">
            <AdminIcon name="fa-search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, SKU, danh mục hoặc giới tính..."
            />
          </div>

          <div className="inventory-ops-controls">
            <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as StockFilter)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="direct">Nhập trực tiếp được</option>
              <option value="variant">Nhiều biến thể (tồn tổng)</option>
              <option value="out">Hết hàng</option>
              <option value="low">Sắp hết</option>
              <option value="watch">Cần theo dõi</option>
              <option value="stable">Ổn định</option>
            </select>
            <button
              type="button"
              className="inventory-ops-btn is-ghost"
              onClick={() => {
                setSearch('');
                setStockFilter('all');
                setSelectedIds([]);
              }}
            >
              <AdminIcon name="fa-rotate-left" />
              <span>Làm mới</span>
            </button>
            <button
              type="button"
              className="inventory-ops-btn is-primary"
              onClick={openBulkModal}
              disabled={selectedCount === 0}
            >
              <AdminIcon name="fa-layer-group" />
              <span>Tạo phiếu nhập nhanh</span>
            </button>
          </div>
        </header>

        {(selectedCount > 0 || visibleRestrictedCount > 0) && (
          <div className="inventory-ops-selection-bar">
            <div className="inventory-ops-selection-copy">
              <span>
                Đã chọn <strong>{selectedCount}</strong> sản phẩm.
              </span>
              {visibleRestrictedCount > 0 && (
                <small>
                  {visibleRestrictedCount} sản phẩm trong danh sách hiện tại có nhiều biến thể — tồn đang quản lý theo tổng.
                </small>
              )}
            </div>
            {selectedCount > 0 && (
              <button
                type="button"
                className="inventory-ops-btn is-ghost is-small"
                onClick={() => setSelectedIds([])}
              >
                Bỏ chọn
              </button>
            )}
          </div>
        )}

        <div className="inventory-ops-table-wrap">
          <table className="inventory-ops-table">
            <thead>
              <tr>
                <th className="inventory-ops-col-select">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Chọn tất cả sản phẩm có thể nhập trực tiếp"
                  />
                </th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Mô hình kho</th>
                <th>Tồn tổng</th>
                <th>Trạng thái</th>
                <th>Cập nhật gần nhất</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const badge = getStockBadge(product.stock, alertSettings);
                const progress = getStockProgress(product.stock, alertSettings);
                const profile = inventoryProfiles.get(product.id) || inventoryService.getStockControlProfile(product);
                const actionHint = profile.canManageDirectly
                  ? 'Nhập bằng phiếu, không cộng trừ tay.'
                  : 'Khóa nhập trực tiếp vì cần tồn theo màu / size.';

                return (
                  <tr
                    key={product.id}
                    className={`inventory-ops-row level-${badge.className} ${
                      selectedIds.includes(product.id) ? 'is-selected' : ''
                    } ${profile.canManageDirectly ? '' : 'is-locked'}`}
                  >
                    <td className="inventory-ops-col-select">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        disabled={!profile.canManageDirectly}
                        onChange={() => toggleSelection(product.id)}
                        title={profile.canManageDirectly ? 'Chọn sản phẩm để tạo phiếu nhập nhanh' : profile.note}
                        aria-label={`Chọn sản phẩm ${product.name}`}
                      />
                    </td>
                    <td>
                      <div className="inventory-ops-product-cell">
                        <img src={product.image} alt={product.name} className="inventory-ops-product-image" />
                        <div className="inventory-ops-product-copy">
                          <strong>{product.name}</strong>
                          <span>{product.subcategory || product.category} • {product.gender}</span>
                          <small>{profile.canManageDirectly ? profile.note : profile.detail}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{product.sku}</code>
                    </td>
                    <td>
                      <div className="inventory-ops-model-cell">
                        <span className={`inventory-ops-mode-badge is-${profile.mode}`}>{profile.label}</span>
                        <small>{profile.detail}</small>
                      </div>
                    </td>
                    <td>
                      <div className="inventory-ops-stock-cell">
                        <strong className={`inventory-ops-stock-number ${badge.className}`}>{product.stock}</strong>
                        <div className="inventory-ops-stock-meter">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inventory-ops-status ${badge.className}`}>
                        <AdminIcon name="fa-circle" />
                        {badge.label}
                      </span>
                    </td>
                    <td>{formatDateTime(product.updatedAt || product.createdAt)}</td>
                    <td>
                      <div className="inventory-ops-row-actions">
                        {profile.canManageDirectly ? (
                          <div className="inventory-ops-btn-group">
                            <button
                              type="button"
                              className="inventory-ops-btn is-secondary is-small"
                              onClick={() => openRestockModal(product)}
                              title="Ghi nhận phiếu nhập"
                            >
                              <AdminIcon name="fa-truck-loading" />
                              <span>Nhập</span>
                            </button>
                            <button
                              type="button"
                              className="inventory-ops-btn is-danger-outline is-small"
                              onClick={() => openExportModal(product)}
                              title="Ghi nhận phiếu xuất"
                              disabled={product.stock <= 0}
                            >
                              <AdminIcon name="fa-truck" />
                              <span>Xuất</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="inventory-ops-btn is-ghost is-small"
                            onClick={() =>
                              setToast({
                                type: 'error',
                                message: profile.note,
                              })
                            }
                            title={profile.note}
                          >
                            <AdminIcon name="fa-circle-info" />
                            <span>Cần tách màu / size</span>
                          </button>
                        )}
                        <span className={`inventory-ops-action-hint ${profile.canManageDirectly ? '' : 'is-danger'}`}>
                          {actionHint}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="inventory-ops-empty">
              <div className="inventory-ops-empty-icon">
                <AdminIcon name="fa-spinner" />
              </div>
              <h3>Đang tải tồn kho</h3>
              <p>Đang lấy danh sách tồn kho từ backend.</p>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="inventory-ops-empty">
              <div className="inventory-ops-empty-icon">
                <AdminIcon name="fa-box-open" />
              </div>
              <h3>Không tìm thấy sản phẩm phù hợp</h3>
              <p>Thử đổi từ khóa hoặc bộ lọc để xem lại danh sách tồn kho theo trạng thái và mô hình quản lý.</p>
            </div>
          )}
        </div>
      </section>

      {showRestockModal && activeProduct && activeProductProfile && (
        <div className="inventory-ops-overlay" onClick={closeRestockModal}>
          <div className="inventory-ops-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="inventory-ops-modal-head">
              <h3>Ghi nhận phiếu nhập</h3>
              <button type="button" className="inventory-ops-close" onClick={closeRestockModal}>
                <AdminIcon name="fa-times" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="inventory-ops-modal-body">
              <div className="inventory-ops-product-preview">
                <img src={activeProduct.image} alt={activeProduct.name} />
                <div>
                  <strong>{activeProduct.name}</strong>
                  <span>{activeProduct.sku}</span>
                </div>
              </div>

              <div className="inventory-ops-inline-note">
                <span className={`inventory-ops-mode-badge is-${activeProductProfile.mode}`}>{activeProductProfile.label}</span>
                <p>{activeProductProfile.note}</p>
              </div>

              <label className="inventory-ops-field">
                <span>Số lượng nhập thêm</span>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(event) => setRestockQuantity(Number(event.target.value))}
                />
                <small>Chỉ dùng cho sản phẩm không gây mơ hồ về màu và size.</small>
              </label>

              <label className="inventory-ops-field">
                <span>Ghi chú / mã phiếu</span>
                <textarea
                  rows={4}
                  value={restockNote}
                  onChange={(event) => setRestockNote(event.target.value)}
                  placeholder="Ví dụ: PN-2603-01 / nhập bổ sung từ nhà cung cấp cho đợt bán mới"
                />
              </label>

              <div className="inventory-ops-preview">
                <div>
                  <span>Tồn hiện tại</span>
                  <strong>{activeProduct.stock}</strong>
                </div>
                <AdminIcon name="fa-arrow-right" />
                <div>
                  <span>Sau khi nhập</span>
                  <strong>{activeProduct.stock + Math.max(restockQuantity, 0)}</strong>
                </div>
              </div>

              <div className="inventory-ops-modal-actions">
                <button type="button" className="inventory-ops-btn is-ghost" onClick={closeRestockModal}>
                  Hủy
                </button>
                <button type="submit" className="inventory-ops-btn is-primary">
                  <AdminIcon name="fa-save" />
                  <span>Lưu phiếu nhập</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExportModal && activeProduct && activeProductProfile && (
        <div className="inventory-ops-overlay" onClick={closeExportModal}>
          <div className="inventory-ops-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="inventory-ops-modal-head">
              <h3>Ghi nhận phiếu xuất</h3>
              <button type="button" className="inventory-ops-close" onClick={closeExportModal}>
                <AdminIcon name="fa-times" />
              </button>
            </div>

            <form onSubmit={handleExportSubmit} className="inventory-ops-modal-body">
              <div className="inventory-ops-product-preview">
                <img src={activeProduct.image} alt={activeProduct.name} />
                <div>
                  <strong>{activeProduct.name}</strong>
                  <span>{activeProduct.sku}</span>
                </div>
              </div>

              <div className="inventory-ops-inline-note is-export">
                <span className={`inventory-ops-mode-badge is-${activeProductProfile.mode}`}>{activeProductProfile.label}</span>
                <p>Xuất kho sẽ trừ tồn. Số lượng xuất không được vượt quá tồn hiện tại ({activeProduct.stock}).</p>
              </div>

              <label className="inventory-ops-field">
                <span>Số lượng xuất</span>
                <input
                  type="number"
                  min="1"
                  max={activeProduct.stock}
                  value={exportQuantity}
                  onChange={(event) => setExportQuantity(Number(event.target.value))}
                />
                {exportQuantity > activeProduct.stock && (
                  <small className="inventory-ops-field-error">Vượt quá tồn kho hiện tại ({activeProduct.stock})</small>
                )}
              </label>

              <label className="inventory-ops-field">
                <span>Ghi chú / lý do xuất</span>
                <textarea
                  rows={4}
                  value={exportNote}
                  onChange={(event) => setExportNote(event.target.value)}
                  placeholder="Ví dụ: PX-2603-01 / hàng hỏng, trả nhà cung cấp, điều chuyển kho..."
                />
              </label>

              <div className="inventory-ops-preview">
                <div>
                  <span>Tồn hiện tại</span>
                  <strong>{activeProduct.stock}</strong>
                </div>
                <AdminIcon name="fa-arrow-right" />
                <div>
                  <span>Sau khi xuất</span>
                  <strong>{Math.max(0, activeProduct.stock - Math.max(exportQuantity, 0))}</strong>
                </div>
              </div>

              <div className="inventory-ops-modal-actions">
                <button type="button" className="inventory-ops-btn is-ghost" onClick={closeExportModal}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inventory-ops-btn is-danger"
                  disabled={exportQuantity <= 0 || exportQuantity > activeProduct.stock}
                >
                  <AdminIcon name="fa-save" />
                  <span>Lưu phiếu xuất</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="inventory-ops-overlay" onClick={closeBulkModal}>
          <div className="inventory-ops-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="inventory-ops-modal-head">
              <h3>Tạo phiếu nhập nhanh</h3>
              <button type="button" className="inventory-ops-close" onClick={closeBulkModal}>
                <AdminIcon name="fa-times" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="inventory-ops-modal-body">
              <div className="inventory-ops-bulk-note">
                <strong>{selectedCount}</strong> sản phẩm đủ điều kiện sẽ được cộng cùng một lượng nhập.
              </div>

              <div className="inventory-ops-inline-note is-soft">
                <span className="inventory-ops-mode-badge is-simple">Chỉ sản phẩm đơn</span>
                <p>Các sản phẩm nhiều biến thể đã bị loại khỏi phiếu nhập nhanh để tránh cộng nhầm tồn cho sai màu hoặc size.</p>
              </div>

              <label className="inventory-ops-field">
                <span>Số lượng nhập cho mỗi sản phẩm</span>
                <input
                  type="number"
                  min="1"
                  value={bulkQuantity}
                  onChange={(event) => setBulkQuantity(Number(event.target.value))}
                />
              </label>

              <label className="inventory-ops-field">
                <span>Ghi chú chung / mã phiếu</span>
                <textarea
                  rows={4}
                  value={bulkNote}
                  onChange={(event) => setBulkNote(event.target.value)}
                  placeholder="Ví dụ: PN-2603-FAST / nhập nhanh cho lô hàng đồng loạt"
                />
              </label>

              <div className="inventory-ops-preview">
                <div>
                  <span>Sản phẩm</span>
                  <strong>{selectedCount}</strong>
                </div>
                <AdminIcon name="fa-arrow-right" />
                <div>
                  <span>Tổng lượng ghi nhận</span>
                  <strong>{selectedCount * Math.max(bulkQuantity, 0)}</strong>
                </div>
              </div>

              <div className="inventory-ops-chip-list">
                {selectedProducts.map((product) => {
                  const profile = inventoryProfiles.get(product.id) || inventoryService.getStockControlProfile(product);

                  return (
                    <span key={product.id} className="inventory-ops-chip">
                      {product.name} • {profile.label}
                    </span>
                  );
                })}
              </div>

              <div className="inventory-ops-modal-actions">
                <button type="button" className="inventory-ops-btn is-ghost" onClick={closeBulkModal}>
                  Hủy
                </button>
                <button type="submit" className="inventory-ops-btn is-primary">
                  <AdminIcon name="fa-layer-group" />
                  <span>Lưu phiếu nhập nhanh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`inventory-ops-toast is-${toast.type}`}>
          <AdminIcon name={toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
