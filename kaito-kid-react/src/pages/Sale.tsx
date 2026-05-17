import ProductListPage from '../components/ProductListPage';

export default function Sale() {
  return (
    <ProductListPage
      title="Khuyến mãi & Giảm giá"
      subtitle="Săn deal cực hot — giá tốt nhất chỉ có ở KaitoKid"
      fixedFilters={{ isSale: true }}
    />
  );
}
