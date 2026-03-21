// Inventory Management

// Load products from localStorage and merge with inventory data
function loadProductsFromStorage() {
  const savedProducts = localStorage.getItem('products');
  const savedInventory = localStorage.getItem('inventory');
  
  let inventoryData = [];
  if (savedInventory) {
    inventoryData = JSON.parse(savedInventory);
  }
  
  if (savedProducts) {
    const products = JSON.parse(savedProducts);
    // Convert products to inventory format and merge with inventory data
    return products.map(p => {
      // Find matching inventory entry
      const invEntry = inventoryData.find(inv => 
        inv.id === p.id || 
        inv.name === p.name ||
        inv.name?.toLowerCase() === p.name?.toLowerCase()
      );
      
      // Use inventory stock if available, otherwise use product stock
      const currentStock = invEntry ? invEntry.stock : (p.stock || 0);
      const soldCount = invEntry ? (invEntry.sold || 0) : 0;
      
      return {
        id: p.id,
        name: p.name,
        sku: p.sku || 'SP' + p.id,
        category: getCategoryKey(p.category, p.menu),
        stock: currentStock,
        sold: soldCount,
        sizes: p.sizes || [],
        colors: p.colors || [],
        variants: p.variants || {},
        image: getProductImage(p)
      };
    });
  }
  
  // If no products, return inventory data directly
  return inventoryData.map(inv => ({
    id: inv.id,
    name: inv.name,
    sku: inv.sku || 'SP' + inv.id,
    category: 'khac',
    stock: inv.stock || 0,
    sold: inv.sold || 0,
    sizes: [],
    colors: [],
    variants: {},
    image: ''
  }));
}

// Get product image (support both formats)
function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  if (product.image) {
    return product.image;
  }
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23667eea" width="50" height="50"/%3E%3C/svg%3E';
}

// Convert category name to key
function getCategoryKey(category, menu) {
  if (!category) return 'khac';
  const cat = category.toLowerCase();
  if (cat.includes('áo') || cat.includes('ao')) {
    if (menu === 'nam') return 'ao-nam';
    if (menu === 'nu') return 'ao-nu';
    return 'ao';
  }
  if (cat.includes('quần') || cat.includes('quan')) {
    if (menu === 'nam') return 'quan-nam';
    if (menu === 'nu') return 'quan-nu';
    return 'quan';
  }
  if (cat.includes('váy') || cat.includes('vay') || cat.includes('đầm') || cat.includes('dam')) {
    return 'ao-nu';
  }
  return 'khac';
}

let inventory = loadProductsFromStorage();
let filteredInventory = [...inventory];
let selectedProductId = null;
let adjustmentVariants = {}; // Store adjustment quantities for each variant

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  updateStats();
  renderInventory();
  setupFilters();
  setupStockForm();
});

// Update statistics
function updateStats() {
  const total = inventory.length;
  const inStock = inventory.filter(p => p.stock > 10).length;
  const lowStock = inventory.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = inventory.filter(p => p.stock === 0).length;
  
  document.getElementById('totalProducts').textContent = total;
  document.getElementById('inStock').textContent = inStock;
  document.getElementById('lowStock').textContent = lowStock;
  document.getElementById('outOfStock').textContent = outOfStock;
}

// Render inventory
function renderInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  
  if (filteredInventory.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-row">
          <i class="fa fa-inbox"></i> Không tìm thấy sản phẩm nào
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredInventory.map(product => {
    const stockStatus = getStockStatus(product.stock);
    const stockClass = getStockClass(product.stock);
    
    return `
      <tr>
        <td><img src="${product.image}" alt="${product.name}" class="product-image"></td>
        <td>
          <div class="product-info">
            <span class="product-name">${product.name}</span>
          </div>
        </td>
        <td><span class="product-sku">${product.sku}</span></td>
        <td>${getCategoryName(product.category)}</td>
        <td><span class="stock-number ${stockClass}">${product.stock}</span></td>
        <td>
          <span class="stock-badge ${stockStatus.class}">
            <i class="fa fa-circle"></i>
            ${stockStatus.text}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-action adjust" onclick="openAdjustModal(${product.id})" title="Điều chỉnh">
              <i class="fa fa-edit"></i> Điều chỉnh
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Setup filters
function setupFilters() {
  const statusFilter = document.getElementById('statusFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  
  statusFilter.addEventListener('change', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const categoryFilter = document.getElementById('categoryFilter').value;
  
  filteredInventory = inventory.filter(product => {
    const matchStatus = !statusFilter || getStockStatus(product.stock).class === statusFilter;
    const matchCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchStatus && matchCategory;
  });
  
  renderInventory();
}

// Reset filters
function resetFilters() {
  document.getElementById('statusFilter').value = '';
  document.getElementById('categoryFilter').value = '';
  filteredInventory = [...inventory];
  renderInventory();
}

// Open stock modal
function openStockModal() {
  document.getElementById('modalTitle').textContent = 'Nhập hàng';
  document.getElementById('stockForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('adjustmentType').value = 'in';
  adjustmentVariants = {};
  
  // Populate product select
  populateProductSelect();
  
  // Hide sections
  document.getElementById('productInfoDisplay').style.display = 'none';
  document.getElementById('variantInventorySection').style.display = 'none';
  document.getElementById('simpleStockSection').style.display = 'none';
  document.getElementById('stockSummary').style.display = 'none';
  
  document.getElementById('stockModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Populate product select dropdown
function populateProductSelect() {
  const select = document.getElementById('productSelect');
  select.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
  
  inventory.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} (${product.sku})`;
    select.appendChild(option);
  });
}

// On product select
function onProductSelect() {
  const productId = parseInt(document.getElementById('productSelect').value);
  
  if (!productId) {
    document.getElementById('productInfoDisplay').style.display = 'none';
    document.getElementById('variantInventorySection').style.display = 'none';
    document.getElementById('simpleStockSection').style.display = 'none';
    document.getElementById('stockSummary').style.display = 'none';
    return;
  }
  
  const product = inventory.find(p => p.id === productId);
  if (!product) return;
  
  selectedProductId = productId;
  document.getElementById('productId').value = productId;
  adjustmentVariants = {};
  
  // Show product info
  document.getElementById('productInfoDisplay').style.display = 'block';
  document.getElementById('productImage').src = product.image;
  document.getElementById('productNameDisplay').textContent = product.name;
  document.getElementById('productSKU').textContent = `SKU: ${product.sku}`;
  
  // Check if product has variants
  if (product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0) {
    document.getElementById('variantInventorySection').style.display = 'block';
    document.getElementById('simpleStockSection').style.display = 'none';
    renderVariantTable(product);
  } else {
    document.getElementById('variantInventorySection').style.display = 'none';
    document.getElementById('simpleStockSection').style.display = 'block';
    document.getElementById('currentStock').value = product.stock;
  }
  
  document.getElementById('stockSummary').style.display = 'block';
  updateStockSummary();
}

// Render variant table
function renderVariantTable(product) {
  const headerRow = document.getElementById('variantTableHeader');
  const tbody = document.getElementById('variantTableBody');
  const tfoot = document.getElementById('variantTableFooter');
  
  // Build header
  let headerHTML = '<th>Size / Màu</th>';
  product.colors.forEach(color => {
    headerHTML += `<th><span class="color-header">${getColorEmoji(color)}</span><br><small>${color}</small></th>`;
  });
  headerHTML += '<th>Hiện tại</th><th>Thay đổi</th>';
  headerRow.innerHTML = headerHTML;
  
  // Build body
  let bodyHTML = '';
  product.sizes.forEach(size => {
    bodyHTML += `<tr><td><span class="size-badge">${size}</span></td>`;
    
    let rowCurrentTotal = 0;
    product.colors.forEach(color => {
      const key = `${size}_${color}`;
      const currentQty = product.variants[key] || 0;
      rowCurrentTotal += currentQty;
      
      bodyHTML += `
        <td>
          <div class="variant-cell">
            <span class="current-qty">${currentQty}</span>
            <input type="number" 
                   class="variant-input" 
                   data-size="${size}" 
                   data-color="${color}"
                   value="0" 
                   min="0" 
                   placeholder="0"
                   onchange="updateVariantAdjustment('${size}', '${color}', this.value)"
                   oninput="updateVariantAdjustment('${size}', '${color}', this.value)">
          </div>
        </td>`;
    });
    
    bodyHTML += `<td class="row-total">${rowCurrentTotal}</td>`;
    bodyHTML += `<td class="row-change" id="rowChange_${size}">+0</td>`;
    bodyHTML += '</tr>';
  });
  tbody.innerHTML = bodyHTML;
  
  // Build footer
  let footerHTML = '<tr class="total-row"><td><strong>Tổng</strong></td>';
  product.colors.forEach(color => {
    let colTotal = 0;
    product.sizes.forEach(size => {
      colTotal += product.variants[`${size}_${color}`] || 0;
    });
    footerHTML += `<td class="col-total">${colTotal}</td>`;
  });
  footerHTML += `<td class="grand-total" id="grandTotalCurrent">${product.stock}</td>`;
  footerHTML += `<td class="grand-change" id="grandTotalChange">+0</td>`;
  footerHTML += '</tr>';
  tfoot.innerHTML = footerHTML;
}

// Get color emoji
function getColorEmoji(color) {
  const colorMap = {
    'Trắng': '⚪',
    'Đen': '⚫',
    'Xám': '🔘',
    'Xanh navy': '🔵',
    'Xanh dương': '💙',
    'Đỏ': '🔴',
    'Hồng': '💗',
    'Vàng': '💛'
  };
  return colorMap[color] || '🔵';
}

// Update variant adjustment
function updateVariantAdjustment(size, color, value) {
  const key = `${size}_${color}`;
  adjustmentVariants[key] = parseInt(value) || 0;
  updateVariantPreview();
}

// Update variant preview
function updateVariantPreview() {
  const product = inventory.find(p => p.id === selectedProductId);
  if (!product) return;
  
  const type = document.getElementById('adjustmentType').value;
  
  // Update row changes
  product.sizes.forEach(size => {
    let rowChange = 0;
    product.colors.forEach(color => {
      const key = `${size}_${color}`;
      rowChange += adjustmentVariants[key] || 0;
    });
    
    const rowChangeEl = document.getElementById(`rowChange_${size}`);
    if (rowChangeEl) {
      if (type === 'in') {
        rowChangeEl.textContent = `+${rowChange}`;
        rowChangeEl.className = 'row-change positive';
      } else if (type === 'out') {
        rowChangeEl.textContent = `-${rowChange}`;
        rowChangeEl.className = 'row-change negative';
      } else {
        rowChangeEl.textContent = `=${rowChange}`;
        rowChangeEl.className = 'row-change neutral';
      }
    }
  });
  
  // Update grand total change
  let totalChange = Object.values(adjustmentVariants).reduce((sum, qty) => sum + qty, 0);
  const grandChangeEl = document.getElementById('grandTotalChange');
  if (grandChangeEl) {
    if (type === 'in') {
      grandChangeEl.textContent = `+${totalChange}`;
      grandChangeEl.className = 'grand-change positive';
    } else if (type === 'out') {
      grandChangeEl.textContent = `-${totalChange}`;
      grandChangeEl.className = 'grand-change negative';
    } else {
      grandChangeEl.textContent = `=${totalChange}`;
      grandChangeEl.className = 'grand-change neutral';
    }
  }
  
  updateStockSummary();
}

// Update stock summary
function updateStockSummary() {
  const product = inventory.find(p => p.id === selectedProductId);
  if (!product) return;
  
  const type = document.getElementById('adjustmentType').value;
  const currentStock = product.stock;
  let totalAdjustment = Object.values(adjustmentVariants).reduce((sum, qty) => sum + qty, 0);
  
  // For simple stock
  if (!product.sizes || product.sizes.length === 0) {
    totalAdjustment = parseInt(document.getElementById('adjustmentQty').value) || 0;
  }
  
  let newStock = currentStock;
  if (type === 'in') {
    newStock = currentStock + totalAdjustment;
  } else if (type === 'out') {
    newStock = Math.max(0, currentStock - totalAdjustment);
  } else {
    newStock = totalAdjustment;
  }
  
  document.getElementById('summaryCurrentStock').textContent = currentStock;
  document.getElementById('summaryNewStock').textContent = newStock;
  
  const changeEl = document.getElementById('summaryChange');
  const diff = newStock - currentStock;
  if (diff > 0) {
    changeEl.innerHTML = `<span class="change-badge positive">+${diff}</span>`;
  } else if (diff < 0) {
    changeEl.innerHTML = `<span class="change-badge negative">${diff}</span>`;
  } else {
    changeEl.innerHTML = `<span class="change-badge neutral">0</span>`;
  }
}

// Open adjust modal
function openAdjustModal(productId) {
  openStockModal();
  document.getElementById('productSelect').value = productId;
  onProductSelect();
}

// Close stock modal
function closeStockModal() {
  document.getElementById('stockModal').classList.remove('active');
  document.body.style.overflow = '';
  selectedProductId = null;
  adjustmentVariants = {};
}

// Setup stock form
function setupStockForm() {
  const form = document.getElementById('stockForm');
  const adjustmentQty = document.getElementById('adjustmentQty');
  
  if (adjustmentQty) {
    adjustmentQty.addEventListener('input', updateStockSummary);
  }
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('productId').value);
    const type = document.getElementById('adjustmentType').value;
    const note = document.getElementById('adjustmentNote').value;
    
    if (!productId) {
      showNotification('Vui lòng chọn sản phẩm', 'error');
      return;
    }
    
    const product = inventory.find(p => p.id === productId);
    if (!product) return;
    
    const oldStock = product.stock;
    let totalAdjustment = 0;
    let variantChanges = [];
    
    // Check if product has variants
    if (product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0) {
      // Update each variant
      product.sizes.forEach(size => {
        product.colors.forEach(color => {
          const key = `${size}_${color}`;
          const adjustQty = adjustmentVariants[key] || 0;
          
          if (adjustQty > 0) {
            const oldVariantQty = product.variants[key] || 0;
            let newVariantQty = oldVariantQty;
            
            if (type === 'in') {
              newVariantQty = oldVariantQty + adjustQty;
            } else if (type === 'out') {
              newVariantQty = Math.max(0, oldVariantQty - adjustQty);
            } else {
              newVariantQty = adjustQty;
            }
            
            product.variants[key] = newVariantQty;
            totalAdjustment += adjustQty;
            
            variantChanges.push({
              size: size,
              color: color,
              oldQty: oldVariantQty,
              newQty: newVariantQty,
              change: adjustQty
            });
          }
        });
      });
      
      // Recalculate total stock
      product.stock = Object.values(product.variants).reduce((sum, qty) => sum + qty, 0);
      
    } else {
      // Simple stock adjustment
      const qty = parseInt(document.getElementById('adjustmentQty').value) || 0;
      
      if (qty <= 0) {
        showNotification('Vui lòng nhập số lượng hợp lệ', 'error');
        return;
      }
      
      if (type === 'in') {
        product.stock = oldStock + qty;
      } else if (type === 'out') {
        product.stock = Math.max(0, oldStock - qty);
      } else {
        product.stock = qty;
      }
      
      totalAdjustment = qty;
    }
    
    if (totalAdjustment === 0) {
      showNotification('Vui lòng nhập số lượng điều chỉnh', 'error');
      return;
    }
    
    // Save to history
    saveToHistory({
      productId: productId,
      productName: product.name,
      type: type,
      quantity: totalAdjustment,
      oldStock: oldStock,
      newStock: product.stock,
      variantChanges: variantChanges,
      note: note,
      date: new Date().toISOString()
    });
    
    // IMPORTANT: Save variants back to localStorage products
    saveInventoryToProducts(productId, product.variants, product.stock);
    
    updateStats();
    renderInventory();
    closeStockModal();
    showNotification('Đã cập nhật tồn kho thành công', 'success');
  });
}

// Save inventory data back to localStorage products
function saveInventoryToProducts(productId, variants, totalStock) {
  const saved = localStorage.getItem('products');
  if (!saved) return;
  
  const products = JSON.parse(saved);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex !== -1) {
    products[productIndex].variants = variants;
    products[productIndex].stock = totalStock;
    products[productIndex].totalStock = totalStock;
    localStorage.setItem('products', JSON.stringify(products));
    
    // Also update inventory localStorage
    updateInventoryStorage(productId, products[productIndex].name, totalStock);
    
    console.log('✅ Saved inventory to products:', productId, variants, totalStock);
  }
}

// Update inventory in localStorage
function updateInventoryStorage(productId, productName, newStock) {
  let inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
  
  const invIndex = inventoryData.findIndex(inv => 
    inv.id === productId || 
    inv.name === productName
  );
  
  if (invIndex !== -1) {
    inventoryData[invIndex].stock = newStock;
  } else {
    inventoryData.push({
      id: productId,
      name: productName,
      stock: newStock,
      sold: 0
    });
  }
  
  localStorage.setItem('inventory', JSON.stringify(inventoryData));
}

// Save to history
function saveToHistory(record) {
  let history = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
  history.unshift(record);
  localStorage.setItem('inventoryHistory', JSON.stringify(history));
}

// Helper functions
function getStockStatus(stock) {
  if (stock === 0) {
    return { class: 'out-of-stock', text: 'Hết hàng' };
  } else if (stock <= 10) {
    return { class: 'low-stock', text: 'Sắp hết' };
  } else {
    return { class: 'in-stock', text: 'Còn hàng' };
  }
}

function getStockClass(stock) {
  if (stock === 0) return 'low';
  if (stock <= 10) return 'medium';
  return 'high';
}

function getCategoryName(category) {
  const categories = {
    'ao-nam': 'Áo nam',
    'quan-nam': 'Quần nam',
    'ao-nu': 'Áo nữ',
    'quan-nu': 'Quần nữ',
    'ao': 'Áo',
    'quan': 'Quần',
    'khac': 'Khác'
  };
  return categories[category] || category;
}

// Notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('stockModal');
  if (e.target === modal) {
    closeStockModal();
  }
});
