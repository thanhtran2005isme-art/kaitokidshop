// ============================================
// ADVANCED PRODUCT SEARCH ENGINE
// Features: Fuzzy Search, Synonyms, Autocomplete, Vietnamese Support
// ============================================

// Search configuration
const SearchConfig = {
  maxFuzzyDistance: 2,        // Max typo tolerance
  minSearchLength: 2,         // Min chars to start search
  maxSuggestions: 8,          // Max autocomplete suggestions
  debounceDelay: 150,         // Debounce delay in ms
  highlightClass: 'search-highlight'
};

// Vietnamese synonyms dictionary
const synonyms = {
  // Clothing
  'áo': ['ao', 'shirt', 'top'],
  'áo sơ mi': ['ao so mi', 'sơ mi', 'so mi', 'shirt'],
  'áo thun': ['ao thun', 't-shirt', 'tshirt', 'áo phông', 'ao phong'],
  'áo khoác': ['ao khoac', 'jacket', 'áo jacket'],
  'áo hoodie': ['hoodie', 'ao hoodie', 'áo nỉ'],
  'áo polo': ['polo', 'ao polo'],
  'áo len': ['ao len', 'sweater', 'áo sweater'],
  'áo vest': ['vest', 'ao vest', 'blazer', 'áo blazer'],
  'quần': ['quan', 'pants', 'trousers'],
  'quần jeans': ['quan jeans', 'jeans', 'quần jean', 'quan jean', 'quần bò', 'quan bo'],
  'quần tây': ['quan tay', 'quần âu', 'quan au', 'dress pants'],
  'quần short': ['quan short', 'short', 'quần đùi', 'quan dui'],
  'quần jogger': ['jogger', 'quan jogger'],
  'váy': ['vay', 'skirt', 'dress', 'đầm', 'dam'],
  'đầm': ['dam', 'dress', 'váy', 'vay'],
  'chân váy': ['chan vay', 'skirt'],
  
  // Categories
  'nữ': ['nu', 'women', 'woman', 'female', 'con gái', 'con gai'],
  'nam': ['men', 'man', 'male', 'con trai'],
  'trẻ em': ['tre em', 'kids', 'children', 'bé', 'be'],
  
  // Colors
  'đen': ['den', 'black'],
  'trắng': ['trang', 'white'],
  'đỏ': ['do', 'red'],
  'xanh': ['xanh dương', 'xanh lá', 'blue', 'green'],
  'vàng': ['vang', 'yellow'],
  'hồng': ['hong', 'pink'],
  'tím': ['tim', 'purple'],
  'nâu': ['nau', 'brown'],
  'xám': ['xam', 'grey', 'gray'],
  'be': ['beige', 'kem'],
  
  // Materials
  'cotton': ['cot ton', 'bông'],
  'linen': ['lanh', 'vải lanh'],
  'denim': ['jean', 'jeans'],
  'kaki': ['khaki'],
  'len': ['wool'],
  'da': ['leather'],
  
  // Styles
  'basic': ['cơ bản', 'co ban'],
  'oversize': ['over size', 'rộng', 'rong'],
  'slim fit': ['slim', 'ôm', 'om'],
  'regular': ['regular fit', 'vừa'],
  
  // Sale/Promo
  'sale': ['giảm giá', 'giam gia', 'khuyến mãi', 'khuyen mai', 'discount'],
  'mới': ['moi', 'new', 'new in', 'hàng mới'],
  'hot': ['bán chạy', 'ban chay', 'bestseller', 'best seller']
};

// Vietnamese character mapping (with/without diacritics)
const vietnameseMap = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  'đ': 'd'
};

// Search state
let allProducts = [];
let searchResults = [];
let currentPage = 1;
const itemsPerPage = 12;
let debounceTimer = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Remove Vietnamese diacritics
function removeDiacritics(str) {
  if (!str) return '';
  return str.toLowerCase().split('').map(char => vietnameseMap[char] || char).join('');
}

// Normalize text for comparison
function normalizeText(text) {
  if (!text) return '';
  return removeDiacritics(text.toLowerCase().trim());
}

// Calculate Levenshtein distance (for fuzzy matching)
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Early exit for empty strings
  if (m === 0) return n;
  if (n === 0) return m;
  
  // Create distance matrix
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}

// Check if text contains query (exact or normalized match)
function containsQuery(query, target) {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);
  
  // Check if target contains query as substring
  if (normalizedTarget.includes(normalizedQuery)) {
    return { match: true, score: 100, type: 'exact' };
  }
  
  // Check word-by-word exact match
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
  const targetWords = normalizedTarget.split(/\s+/);
  
  let matchedWords = 0;
  
  for (const qWord of queryWords) {
    for (const tWord of targetWords) {
      // Exact word match or word starts with query
      if (tWord === qWord || tWord.startsWith(qWord)) {
        matchedWords++;
        break;
      }
    }
  }
  
  if (matchedWords === queryWords.length && queryWords.length > 0) {
    return { match: true, score: 90, type: 'word' };
  }
  
  return { match: false, score: 0, type: 'none' };
}

// Check if fuzzy match (within allowed typos) - STRICT version
function isFuzzyMatch(query, target, maxDistance = SearchConfig.maxFuzzyDistance) {
  // First try exact match
  const exactMatch = containsQuery(query, target);
  if (exactMatch.match) return exactMatch;
  
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);
  
  // Word-by-word fuzzy match - STRICT
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
  const targetWords = normalizedTarget.split(/\s+/);
  
  if (queryWords.length === 0) return { match: false, score: 0 };
  
  let matchedWords = 0;
  let totalScore = 0;
  
  for (const qWord of queryWords) {
    let bestMatch = { distance: Infinity, word: '', score: 0 };
    
    for (const tWord of targetWords) {
      // Skip very short target words for fuzzy matching
      if (tWord.length < 3) continue;
      
      // Prefix match (high priority)
      if (tWord.startsWith(qWord)) {
        bestMatch = { distance: 0, word: tWord, score: 95 };
        break;
      }
      
      // Only fuzzy match if words are similar length (within 2 chars)
      if (Math.abs(qWord.length - tWord.length) > 2) continue;
      
      // Fuzzy match
      const distance = levenshteinDistance(qWord, tWord);
      
      // Stricter tolerance: only 1 typo for short words, max 2 for longer
      const tolerance = qWord.length <= 4 ? 1 : Math.min(maxDistance, 2);
      
      if (distance <= tolerance && distance < bestMatch.distance) {
        const score = Math.max(0, 80 - distance * 25);
        bestMatch = { distance, word: tWord, score };
      }
    }
    
    if (bestMatch.score > 0) {
      matchedWords++;
      totalScore += bestMatch.score;
    }
  }
  
  // Require ALL query words to match for multi-word queries
  if (matchedWords === queryWords.length && matchedWords > 0) {
    return { match: true, score: totalScore / queryWords.length };
  }
  
  // For single word query, require at least one match
  if (queryWords.length === 1 && matchedWords > 0) {
    return { match: true, score: totalScore };
  }
  
  return { match: false, score: 0 };
}


// Expand query with synonyms
function expandQueryWithSynonyms(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const expandedTerms = [normalizedQuery];
  
  // Check each synonym group
  for (const [key, values] of Object.entries(synonyms)) {
    const normalizedKey = normalizeText(key);
    const normalizedValues = values.map(v => normalizeText(v));
    
    // If query matches key or any value, add all related terms
    if (normalizedQuery.includes(normalizedKey) || 
        normalizedValues.some(v => normalizedQuery.includes(v))) {
      expandedTerms.push(key);
      expandedTerms.push(...values);
    }
  }
  
  return [...new Set(expandedTerms)];
}

// ============================================
// SEARCH ENGINE
// ============================================

// Main search function
function searchProducts(query, products) {
  const startTime = performance.now();
  
  if (!query || query.length < SearchConfig.minSearchLength) {
    return { results: [], time: 0 };
  }
  
  const normalizedQuery = normalizeText(query);
  const expandedTerms = expandQueryWithSynonyms(query);
  
  const scoredResults = [];
  
  for (const product of products) {
    let totalScore = 0;
    let primaryMatch = false; // Must have primary match (name or synonym)
    
    // 1. Search in product name (PRIMARY - highest weight)
    const nameMatch = isFuzzyMatch(query, product.name, SearchConfig.maxFuzzyDistance);
    if (nameMatch.match) {
      totalScore += nameMatch.score * 3;
      primaryMatch = true;
      
      // Extra boost for exact substring match
      if (normalizeText(product.name).includes(normalizedQuery)) {
        totalScore += 50;
      }
    }
    
    // 2. Search with expanded synonyms (PRIMARY)
    if (!primaryMatch) {
      for (const term of expandedTerms) {
        if (term === normalizedQuery) continue;
        
        // Check if product name contains the synonym term
        const synonymMatch = containsQuery(term, product.name);
        if (synonymMatch.match) {
          totalScore += synonymMatch.score * 2;
          primaryMatch = true;
          break;
        }
      }
    }
    
    // Only add secondary matches if primary match found
    if (primaryMatch) {
      // 3. Boost for category match
      if (product.category) {
        const catMatch = containsQuery(query, product.category);
        if (catMatch.match) {
          totalScore += catMatch.score * 0.5;
        }
      }
    }
    
    // 4. Special case: sale search
    if (normalizedQuery.includes('sale') || normalizedQuery.includes('giam gia')) {
      if (product.originalPrice && product.price < product.originalPrice) {
        totalScore += 30;
        primaryMatch = true;
      }
    }
    
    // Only include if primary match found
    if (primaryMatch && totalScore > 0) {
      scoredResults.push({ product, score: totalScore });
    }
  }
  
  // Sort by score (descending)
  scoredResults.sort((a, b) => b.score - a.score);
  
  const endTime = performance.now();
  
  return {
    results: scoredResults.map(r => r.product),
    time: Math.round(endTime - startTime)
  };
}

// ============================================
// AUTOCOMPLETE
// ============================================

// Generate autocomplete suggestions
function getAutocompleteSuggestions(query, products) {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = normalizeText(query);
  const suggestions = new Map(); // Use Map to avoid duplicates
  
  // 1. Product name suggestions (prefix match)
  for (const product of products) {
    const normalizedName = normalizeText(product.name);
    
    // Prefix match on full name
    if (normalizedName.startsWith(normalizedQuery)) {
      suggestions.set(product.name, { type: 'product', text: product.name, product });
    }
    
    // Prefix match on words
    const words = product.name.split(/\s+/);
    for (const word of words) {
      if (normalizeText(word).startsWith(normalizedQuery) && word.length > 2) {
        suggestions.set(word.toLowerCase(), { type: 'keyword', text: word });
      }
    }
  }
  
  // 2. Category suggestions
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  for (const cat of categories) {
    if (normalizeText(cat).includes(normalizedQuery)) {
      suggestions.set(cat, { type: 'category', text: cat });
    }
  }
  
  // 3. Synonym suggestions
  for (const [key, values] of Object.entries(synonyms)) {
    if (normalizeText(key).startsWith(normalizedQuery)) {
      suggestions.set(key, { type: 'keyword', text: key });
    }
    for (const val of values) {
      if (normalizeText(val).startsWith(normalizedQuery)) {
        suggestions.set(key, { type: 'keyword', text: key }); // Suggest the main term
      }
    }
  }
  
  // Convert to array and limit
  return Array.from(suggestions.values()).slice(0, SearchConfig.maxSuggestions);
}

// ============================================
// UI FUNCTIONS
// ============================================

// Load all products
async function loadAllProducts() {
  // Try to get from localStorage first
  let products = JSON.parse(localStorage.getItem('products') || '[]');
  
  // If no products in localStorage, try to fetch from JSON file
  if (products.length === 0) {
    try {
      const response = await fetch('/data/products.json');
      if (response.ok) {
        products = await response.json();
      }
    } catch (e) {
      console.log('No external products file found');
    }
  }
  
  allProducts = products;
  return products;
}

// Perform search and display results
async function performSearch(query = null) {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = query || searchInput?.value || new URLSearchParams(window.location.search).get('q') || '';
  
  if (!searchQuery || searchQuery.length < SearchConfig.minSearchLength) {
    displayNoResults('Vui lòng nhập từ khóa tìm kiếm (ít nhất 2 ký tự)');
    return;
  }
  
  // Update input value
  if (searchInput) searchInput.value = searchQuery;
  
  // Show loading
  const resultsGrid = document.getElementById('searchResultsGrid');
  if (resultsGrid) {
    resultsGrid.innerHTML = '<div class="search-loading"><i class="fa fa-spinner fa-spin"></i> Đang tìm kiếm...</div>';
  }
  
  // Load products if not loaded
  if (allProducts.length === 0) {
    await loadAllProducts();
  }
  
  // Perform search
  const { results, time } = searchProducts(searchQuery, allProducts);
  searchResults = results;
  currentPage = 1;
  
  // Update UI
  updateSearchHeader(searchQuery, results.length, time);
  displayResults(results);
  hideSuggestions();
}

// Update search header
function updateSearchHeader(query, count, time) {
  const queryEl = document.getElementById('searchQuery');
  const countEl = document.getElementById('resultCount');
  
  if (queryEl) {
    queryEl.innerHTML = `Kết quả cho: "<strong>${escapeHtml(query)}</strong>"`;
  }
  
  if (countEl) {
    countEl.innerHTML = `Tìm thấy <strong>${count}</strong> sản phẩm (${time}ms)`;
  }
}

// Display search results
function displayResults(results) {
  const grid = document.getElementById('searchResultsGrid');
  if (!grid) return;
  
  if (results.length === 0) {
    displayNoResults('Không tìm thấy sản phẩm phù hợp');
    return;
  }
  
  // Pagination
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedResults = results.slice(start, end);
  
  grid.innerHTML = paginatedResults.map(product => createProductCard(product)).join('');
  
  updatePagination(results.length);
}

// Create product card HTML
function createProductCard(product) {
  const price = product.price || 0;
  const originalPrice = product.originalPrice || product.oldPrice || 0;
  const discount = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  // Support multiple image field formats
  let image = '/images/placeholder.png';
  if (product.images && product.images.length > 0) {
    image = product.images[0];
  } else if (product.image) {
    image = product.image;
  } else if (product.imgSrc) {
    image = product.imgSrc;
  }
  
  const productLink = `chitietsanpham.html?id=${product.id}`;
  
  return `
    <div class="product-card" onclick="window.location.href='${productLink}'">
      ${discount > 0 ? `<span class="product-badge sale">-${discount}%</span>` : ''}
      <div class="product-image">
        <img src="${image}" alt="${escapeHtml(product.name)}" loading="lazy" 
             onerror="this.onerror=null; this.src='/images/placeholder.png';">
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <div class="product-price">
          <span class="current-price">${formatPrice(price)}</span>
          ${originalPrice > price ? `<span class="original-price">${formatPrice(originalPrice)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Display no results message
function displayNoResults(message) {
  const grid = document.getElementById('searchResultsGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fa fa-search"></i>
        <h3>${message}</h3>
        <p>Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả</p>
        <div class="search-suggestions-box">
          <h4>Gợi ý tìm kiếm:</h4>
          <div class="suggestion-tags">
            <span onclick="performSearch('áo thun')">Áo thun</span>
            <span onclick="performSearch('quần jeans')">Quần jeans</span>
            <span onclick="performSearch('váy đầm')">Váy đầm</span>
            <span onclick="performSearch('áo khoác')">Áo khoác</span>
          </div>
        </div>
      </div>
    `;
  }
  
  const pagination = document.getElementById('pagination');
  if (pagination) pagination.innerHTML = '';
}


// ============================================
// AUTOCOMPLETE UI
// ============================================

// Show autocomplete suggestions
function showSuggestions(query) {
  const container = document.getElementById('searchSuggestions');
  if (!container) return;
  
  if (!query || query.length < 2) {
    hideSuggestions();
    return;
  }
  
  const suggestions = getAutocompleteSuggestions(query, allProducts);
  
  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }
  
  container.innerHTML = suggestions.map(s => {
    const icon = s.type === 'product' ? 'fa-box' : 
                 s.type === 'category' ? 'fa-folder' : 'fa-search';
    const typeLabel = s.type === 'product' ? 'Sản phẩm' : 
                      s.type === 'category' ? 'Danh mục' : 'Từ khóa';
    
    return `
      <div class="suggestion-item" onclick="selectSuggestion('${escapeHtml(s.text)}')">
        <i class="fa ${icon}"></i>
        <span class="suggestion-text">${highlightMatch(s.text, query)}</span>
        <span class="suggestion-type">${typeLabel}</span>
      </div>
    `;
  }).join('');
  
  container.classList.add('active');
}

// Hide suggestions
function hideSuggestions() {
  const container = document.getElementById('searchSuggestions');
  if (container) {
    container.classList.remove('active');
  }
}

// Select suggestion
function selectSuggestion(text) {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = text;
  }
  hideSuggestions();
  performSearch(text);
}

// Highlight matching text
function highlightMatch(text, query) {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);
  
  if (index === -1) return escapeHtml(text);
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return `${escapeHtml(before)}<strong>${escapeHtml(match)}</strong>${escapeHtml(after)}`;
}

// ============================================
// EVENT HANDLERS
// ============================================

// Handle search input keyup
function handleSearchKeyup(event) {
  const query = event.target.value;
  
  // Clear previous debounce
  if (debounceTimer) clearTimeout(debounceTimer);
  
  // Enter key - perform search
  if (event.key === 'Enter') {
    hideSuggestions();
    performSearch(query);
    return;
  }
  
  // Escape key - hide suggestions
  if (event.key === 'Escape') {
    hideSuggestions();
    return;
  }
  
  // Debounce autocomplete
  debounceTimer = setTimeout(() => {
    showSuggestions(query);
  }, SearchConfig.debounceDelay);
}

// Sort results
function sortResults() {
  const sortBy = document.getElementById('sortFilter')?.value || 'relevant';
  
  let sorted = [...searchResults];
  
  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case 'bestseller':
      sorted.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      break;
    // 'relevant' - keep original order (by search score)
  }
  
  currentPage = 1;
  displayResults(sorted);
}

// Filter results by category
function filterResults() {
  const category = document.getElementById('categoryFilter')?.value || 'all';
  
  let filtered = [...searchResults];
  
  if (category !== 'all') {
    const categoryMap = {
      'nu': ['nữ', 'nu', 'women', 'woman'],
      'nam': ['nam', 'men', 'man'],
      'treem': ['trẻ em', 'tre em', 'kids', 'children']
    };
    
    const categoryTerms = categoryMap[category] || [];
    filtered = searchResults.filter(p => {
      const cat = normalizeText(p.category || '');
      return categoryTerms.some(term => cat.includes(normalizeText(term)));
    });
  }
  
  currentPage = 1;
  displayResults(filtered);
}

// ============================================
// PAGINATION
// ============================================

function updatePagination(totalItems) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Previous button
  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
    <i class="fa fa-chevron-left"></i>
  </button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="page-dots">...</span>';
    }
  }
  
  // Next button
  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
    <i class="fa fa-chevron-right"></i>
  </button>`;
  
  pagination.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  displayResults(searchResults);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

// ============================================
// GLOBAL SEARCH (for header search bar)
// ============================================

// Initialize search on any page with search bar
function initGlobalSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  // Load products for autocomplete
  loadAllProducts();
  
  // Add event listeners
  searchInput.addEventListener('input', (e) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      showSuggestions(e.target.value);
    }, SearchConfig.debounceDelay);
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Redirect to search page
        window.location.href = `timkiem.html?q=${encodeURIComponent(query)}`;
      }
    }
    if (e.key === 'Escape') {
      hideSuggestions();
    }
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
      hideSuggestions();
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check if on search results page
  const isSearchPage = window.location.pathname.includes('timkiem');
  
  if (isSearchPage) {
    // Load products and perform search from URL
    await loadAllProducts();
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      performSearch(query);
    }
  }
  
  // Initialize global search (header search bar)
  initGlobalSearch();
});

// Export functions for global use
window.performSearch = performSearch;
window.handleSearchKeyup = handleSearchKeyup;
window.selectSuggestion = selectSuggestion;
window.sortResults = sortResults;
window.filterResults = filterResults;
window.goToPage = goToPage;
