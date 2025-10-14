import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Eye, Star, MapPin, Package, Leaf, X, ChevronLeft, ChevronRight, Plus, Upload, Check, Truck, Phone, CreditCard, ArrowLeft, Calendar, Globe } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe('pk_test_51SFEF9DrJ7nDJfDvIMnTuqgarlVwFixEnBIZiJJd5FWsljj92Tbrhux9NuGTkgaGHTaBoCwDZGBhOfYUBdgt1y1200w1OPqduz');

const API_BASE_URL = 'http://localhost:8000';

// Translations
const translations = {
  en: {
    marketplace: 'Products Marketplace',
    myOrders: 'My Orders',
    mySales: 'My Sales',
    listProduct: 'List Product',
    seedData: 'Seed Data',
    searchProducts: 'Search products...',
    allCategories: 'All Categories',
    district: 'District',
    newest: 'Newest',
    price: 'Price',
    rating: 'Rating',
    organicOnly: 'Organic Only',
    noProducts: 'No products found',
    viewDetails: 'View Details',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    backToMarketplace: 'Back to Marketplace',
    noOrdersYet: 'No orders yet',
    startShopping: 'Start shopping to see your orders here',
    browseProducts: 'Browse Products',
    order: 'Order',
    seller: 'Seller',
    quantity: 'Quantity',
    noSalesYet: 'No sales yet',
    listFirstProduct: 'List your first product to start selling',
    customerDetails: 'Customer Details',
    name: 'Name',
    phone: 'Phone',
    deliveryAddress: 'Delivery Address',
    listNewProduct: 'List New Product',
    productTitle: 'Product Title',
    description: 'Description',
    selectCategory: 'Select Category',
    unit: 'Unit (e.g., per kg)',
    stockAvailable: 'Stock Available',
    stockUnit: 'Stock Unit',
    location: 'Location',
    organicCertified: 'Organic Certified',
    uploadImages: 'Upload Images',
    uploading: 'Uploading...',
    cancel: 'Cancel',
    createProduct: 'Create Product',
    creating: 'Creating...',
    stock: 'Stock',
    orderNow: 'Order Now',
    enterShippingDetails: 'Enter Shipping Details',
    shippingAddress: 'Shipping Address',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    addressLine1: 'Address Line 1 (House No, Building)',
    addressLine2: 'Address Line 2 (Street, Locality)',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    orderNotes: 'Order Notes (Optional)',
    totalAmount: 'Total Amount',
    proceedToPayment: 'Proceed to Payment',
    completePayment: 'Complete Payment',
    testCard: 'Test Card',
    pay: 'Pay',
    processing: 'Processing...',
    paymentSuccessful: 'Payment Successful!',
    deliveryInformation: 'Delivery Information',
    address: 'Address',
    sellerContact: 'The seller will contact you shortly to arrange delivery. You can track your order in "My Orders" section.',
    viewMyOrders: 'View My Orders',
    continueShopping: 'Continue Shopping',
    min: 'Min',
    max: 'Max',
    certifiedOrganic: 'Certified Organic',
    productCreated: 'Product created successfully!',
    ordersCount: 'orders',
    perUnit: 'per'
  },
  te: {
    marketplace: 'ఉత్పత్తుల మార్కెట్',
    myOrders: 'నా ఆర్డర్లు',
    mySales: 'నా అమ్మకాలు',
    listProduct: 'ఉత్పత్తిని జాబితా చేయండి',
    seedData: 'డేటా సీడ్',
    searchProducts: 'ఉత్పత్తులను వెతకండి...',
    allCategories: 'అన్ని వర్గాలు',
    district: 'జిల్లా',
    newest: 'కొత్తవి',
    price: 'ధర',
    rating: 'రేటింగ్',
    organicOnly: 'సేంద్రియ మాత్రమే',
    noProducts: 'ఉత్పత్తులు కనుగొనబడలేదు',
    viewDetails: 'వివరాలు చూడండి',
    previous: 'మునుపటిది',
    next: 'తదుపరి',
    page: 'పేజీ',
    of: 'యొక్క',
    backToMarketplace: 'మార్కెట్‌కు తిరిగి వెళ్ళండి',
    noOrdersYet: 'ఇంకా ఆర్డర్లు లేవు',
    startShopping: 'మీ ఆర్డర్లను ఇక్కడ చూడటానికి షాపింగ్ ప్రారంభించండి',
    browseProducts: 'ఉత్పత్తులను బ్రౌజ్ చేయండి',
    order: 'ఆర్డర్',
    seller: 'విక్రేత',
    quantity: 'పరిమాణం',
    noSalesYet: 'ఇంకా అమ్మకాలు లేవు',
    listFirstProduct: 'అమ్మకం ప్రారంభించడానికి మీ మొదటి ఉత్పత్తిని జాబితా చేయండి',
    customerDetails: 'కస్టమర్ వివరాలు',
    name: 'పేరు',
    phone: 'ఫోన్',
    deliveryAddress: 'డెలివరీ చిరునామా',
    listNewProduct: 'కొత్త ఉత్పత్తిని జాబితా చేయండి',
    productTitle: 'ఉత్పత్తి శీర్షిక',
    description: 'వివరణ',
    selectCategory: 'వర్గం ఎంచుకోండి',
    unit: 'యూనిట్ (ఉదా., కిలోకు)',
    stockAvailable: 'స్టాక్ అందుబాటులో',
    stockUnit: 'స్టాక్ యూనిట్',
    location: 'స్థానం',
    organicCertified: 'సేంద్రియ ధృవీకరించబడింది',
    uploadImages: 'చిత్రాలను అప్‌లోడ్ చేయండి',
    uploading: 'అప్‌లోడ్ అవుతోంది...',
    cancel: 'రద్దు చేయండి',
    createProduct: 'ఉత్పత్తిని సృష్టించండి',
    creating: 'సృష్టిస్తోంది...',
    stock: 'స్టాక్',
    orderNow: 'ఇప్పుడే ఆర్డర్ చేయండి',
    enterShippingDetails: 'షిప్పింగ్ వివరాలను నమోదు చేయండి',
    shippingAddress: 'షిప్పింగ్ చిరునామా',
    fullName: 'పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    addressLine1: 'చిరునామా లైన్ 1 (ఇంటి నంబర్, భవనం)',
    addressLine2: 'చిరునామా లైన్ 2 (వీధి, ప్రాంతం)',
    city: 'నగరం',
    state: 'రాష్ట్రం',
    pincode: 'పిన్‌కోడ్',
    orderNotes: 'ఆర్డర్ గమనికలు (ఐచ్ఛికం)',
    totalAmount: 'మొత్తం మొత్తం',
    proceedToPayment: 'చెల్లింపుకు కొనసాగండి',
    completePayment: 'చెల్లింపు పూర్తి చేయండి',
    testCard: 'టెస్ట్ కార్డ్',
    pay: 'చెల్లించండి',
    processing: 'ప్రాసెస్ అవుతోంది...',
    paymentSuccessful: 'చెల్లింపు విజయవంతమైంది!',
    deliveryInformation: 'డెలివరీ సమాచారం',
    address: 'చిరునామా',
    sellerContact: 'విక్రేత త్వరలో డెలివరీని ఏర్పాటు చేయడానికి మిమ్మల్ని సంప్రదిస్తారు. మీరు "నా ఆర్డర్లు" విభాగంలో మీ ఆర్డర్‌ను ట్రాక్ చేయవచ్చు.',
    viewMyOrders: 'నా ఆర్డర్లను చూడండి',
    continueShopping: 'షాపింగ్ కొనసాగించండి',
    min: 'కనిష్ట',
    max: 'గరిష్ట',
    certifiedOrganic: 'ధృవీకరించబడిన సేంద్రియ',
    productCreated: 'ఉత్పత్తి విజయవంతంగా సృష్టించబడింది!',
    ordersCount: 'ఆర్డర్లు',
    perUnit: 'కు'
  }
};

const CheckoutForm = ({ clientSecret, onSuccess, onCancel, totalAmount, orderNumber, t }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (error) {
        setError(error.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">{t.order} #{orderNumber}</div>
        <div className="text-3xl font-bold text-green-600">
          ₹{totalAmount.toFixed(2)}
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' }
            },
            invalid: { color: '#9e2146' }
          }
        }} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        💳 {t.testCard}: 4000 0035 6000 0008 | Exp: 12/25 | CVC: 123
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={processing}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              {t.pay} ₹{totalAmount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const Products = () => {
  const [language, setLanguage] = useState('en');
  const t = translations[language];
  
  const [activeView, setActiveView] = useState('marketplace');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    district: '',
    organic_only: false,
    sort_by: 'created_at'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    total: 0,
    total_pages: 0
  });
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    district: '',
    state: 'Andhra Pradesh',
    pincode: ''
  });
  
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    buyer_notes: ''
  });
  
  const [orderData, setOrderData] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [myOrders, setMyOrders] = useState([]);
  const [mySales, setMySales] = useState([]);
  const {getToken} = useAuth();
  
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    unit: '',
    stock_available: '',
    stock_unit: '',
    organic_certified: false,
    images: [],
    location: '',
    district: ''
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        page_size: pagination.page_size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== false)
        )
      });

      const response = await fetch(`${API_BASE_URL}/api/products?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        total_pages: data.total_pages
      }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/categories`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProductDetail = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      setSelectedProduct(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      setMyOrders(data);
      setActiveView('myOrders');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMySales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/orders/my-sales`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      setMySales(data);
      setActiveView('mySales');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/community/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, data.image_url]
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async () => {
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock_available: parseFloat(productForm.stock_available),
          min_order_quantity: 1,
          suitable_for_crops: []
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${t.productCreated}`);
        setShowCreateModal(false);
        resetProductForm();
        fetchProducts();
      } else {
        alert(data.detail || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating product');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct) return;
    
    if (!orderForm.quantity || orderForm.quantity < 1) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address_line1 || 
        !shippingAddress.city || !shippingAddress.district || !shippingAddress.pincode) {
      alert('Please fill all required address fields');
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${selectedProduct.id}/order`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quantity: parseInt(orderForm.quantity),
            shipping_address: shippingAddress,
            buyer_notes: orderForm.buyer_notes || ''
          })
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setOrderData(data);
        setShowOrderModal(false);
        setShowPaymentModal(true);
      } else {
        console.error('Order error:', data);
        alert(`❌ Failed to create order:\n${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Error creating order');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/orders/${orderData.order_id}/confirm-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );
      
      if (response.ok) {
        setPaymentSuccess(true);
      } else {
        alert('Payment succeeded but confirmation failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Payment verification failed');
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('Seed sample data?')) return;
    
    setSeeding(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/seed-products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        alert('✅ Products seeded successfully!');
        fetchProducts();
      } else {
        const error = await response.json();
        alert(`Failed: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSeeding(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      category: '',
      price: '',
      unit: '',
      stock_available: '',
      stock_unit: '',
      organic_certified: false,
      images: [],
      location: '',
      district: ''
    });
  };

  const resetOrderForm = () => {
    setOrderForm({ quantity: 1, buyer_notes: '' });
    setShippingAddress({
      name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      district: '',
      state: 'Andhra Pradesh',
      pincode: ''
    });
    setOrderData(null);
    setPaymentSuccess(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {product.thumbnail ? (
          <img 
            src={product.thumbnail} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {product.organic_certified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            {language === 'en' ? 'Organic' : 'సేంద్రియ'}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{product.district}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500">({product.orders_count} {t.ordersCount})</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-green-600">₹{product.price}</div>
            <div className="text-xs text-gray-500">{product.unit}</div>
          </div>
          <div className="text-sm text-gray-600">
            {t.stock}: {product.stock_available}
          </div>
        </div>
        
        <button
          onClick={() => fetchProductDetail(product.id)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {t.viewDetails}
        </button>
      </div>
    </div>
  );

  const MarketplaceView = () => (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t.searchProducts}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">{t.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder={t.district}
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          
          <select
            value={filters.sort_by}
            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="created_at">{t.newest}</option>
            <option value="price">{t.price}</option>
            <option value="rating">{t.rating}</option>
          </select>
        </div>
        
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.organic_only}
            onChange={(e) => handleFilterChange('organic_only', e.target.checked)}
            className="w-4 h-4"
          />
          <Leaf className="w-4 h-4 text-green-600" />
          {t.organicOnly}
        </label>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t.noProducts}</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {pagination.total_pages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t.previous}
              </button>
              
              <span className="text-gray-600">
                {t.page} {pagination.page} {t.of} {pagination.total_pages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.total_pages}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {t.next}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  const MyOrdersView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t.myOrders}</h2>
        <button
          onClick={() => setActiveView('marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.backToMarketplace}
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noOrdersYet}</h3>
          <p className="text-gray-600 mb-4">{t.startShopping}</p>
          <button
            onClick={() => setActiveView('marketplace')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t.browseProducts}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.order} #{order.order_number}</h3>
                  <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.order_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded">
                  {order.product_image && (
                    <img src={order.product_image} alt={order.product_title} className="w-full h-full object-cover rounded" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{order.product_title}</h4>
                  <p className="text-sm text-gray-600">{t.seller}: {order.seller_name}</p>
                  <p className="text-sm text-gray-600">{t.quantity}: {order.quantity} {order.unit}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    ₹{order.total_price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MySalesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t.mySales}</h2>
        <button
          onClick={() => setActiveView('marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.backToMarketplace}
        </button>
      </div>

      {mySales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noSalesYet}</h3>
          <p className="text-gray-600 mb-4">{t.listFirstProduct}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t.listProduct}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mySales.map(sale => (
            <div key={sale.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.order} #{sale.order_number}</h3>
                  <p className="text-sm text-gray-600">{new Date(sale.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sale.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                  sale.order_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {sale.order_status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{sale.product_title}</h4>
                  <p className="text-sm text-gray-600">{t.quantity}: {sale.quantity} {sale.unit}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t.customerDetails}
                  </h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>{t.name}:</strong> {sale.buyer_name}</p>
                    <p><strong>{t.phone}:</strong> {sale.buyer_phone}</p>
                    {sale.buyer_address && (
                      <>
                        <p className="mt-2"><strong>{t.deliveryAddress}:</strong></p>
                        <p>{sale.buyer_address.name}</p>
                        <p>{sale.buyer_address.address_line1}</p>
                        {sale.buyer_address.address_line2 && <p>{sale.buyer_address.address_line2}</p>}
                        <p>{sale.buyer_address.city}, {sale.buyer_address.district}</p>
                        <p>{sale.buyer_address.state} - {sale.buyer_address.pincode}</p>
                        <p><strong>{t.phone}:</strong> {sale.buyer_address.phone}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{sale.total_price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{t.marketplace}</h1>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Globe className="w-5 h-5" />
                {language === 'en' ? 'తెలుగు' : 'English'}
              </button>
              <button
                onClick={fetchMyOrders}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                {t.myOrders}
              </button>
              <button
                onClick={fetchMySales}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Truck className="w-5 h-5" />
                {t.mySales}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t.listProduct}
              </button>
            
            </div>
          </div>
        </div>
        
        {activeView === 'marketplace' && <MarketplaceView />}
        {activeView === 'myOrders' && <MyOrdersView />}
        {activeView === 'mySales' && <MySalesView />}
      </div>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t.listNewProduct}</h2>
              <button onClick={() => { setShowCreateModal(false); resetProductForm(); }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder={`${t.productTitle} *`}
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                placeholder={`${t.description} *`}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectCategory} *</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  step="0.01"
                  placeholder={`${t.price} *`}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder={`${t.unit} *`}
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="number"
                  placeholder={`${t.stockAvailable} *`}
                  value={productForm.stock_available}
                  onChange={(e) => setProductForm({ ...productForm, stock_available: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder={`${t.stockUnit} *`}
                  value={productForm.stock_unit}
                  onChange={(e) => setProductForm({ ...productForm, stock_unit: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder={`${t.location} *`}
                  value={productForm.location}
                  onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder={`${t.district} *`}
                  value={productForm.district}
                  onChange={(e) => setProductForm({ ...productForm, district: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t.uploadImages}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {uploadingImage && <p className="text-sm text-blue-600 mt-1">{t.uploading}</p>}
                {productForm.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {productForm.images.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20">
                        <img src={url} alt="" className="w-full h-full object-cover rounded" />
                        <button
                          onClick={() => setProductForm({
                            ...productForm,
                            images: productForm.images.filter((_, i) => i !== idx)
                          })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.organic_certified}
                  onChange={(e) => setProductForm({ ...productForm, organic_certified: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <Leaf className="w-4 h-4 text-green-600" />
                <span>{t.organicCertified}</span>
              </label>
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowCreateModal(false); resetProductForm(); }}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreateProduct}
                  disabled={creating || !productForm.title || !productForm.price || !productForm.category}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {creating ? t.creating : t.createProduct}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedProduct && !showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
              <button onClick={() => setSelectedProduct(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.title}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-green-600 mb-1">
                      ₹{selectedProduct.price}
                    </div>
                    <div className="text-gray-600">{selectedProduct.unit}</div>
                  </div>
                  
                  {selectedProduct.organic_certified && (
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full mb-4">
                      <Leaf className="w-4 h-4" />
                      {t.certifiedOrganic}
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.stock}:</span>
                      <span className="font-semibold">{selectedProduct.stock_available} {selectedProduct.stock_unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.location}:</span>
                      <span className="font-semibold">{selectedProduct.location}, {selectedProduct.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.seller}:</span>
                      <span className="font-semibold">{selectedProduct.seller.name}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowOrderModal(true);
                      setOrderForm({ ...orderForm, quantity: selectedProduct.min_order_quantity || 1 });
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-lg font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t.orderNow}
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-3">{t.description}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProduct.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t.enterShippingDetails}</h2>
              <button onClick={() => setShowOrderModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gray-200 rounded">
                    {selectedProduct.images && selectedProduct.images[0] && (
                      <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover rounded" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedProduct.title}</h3>
                    <p className="text-sm text-gray-600">₹{selectedProduct.price} {t.perUnit} {selectedProduct.unit}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t.quantity} *</label>
                  <input
                    type="number"
                    min={selectedProduct.min_order_quantity || 1}
                    max={selectedProduct.stock_available}
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.min}: {selectedProduct.min_order_quantity || 1}, {t.max}: {selectedProduct.stock_available}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">{t.shippingAddress}</h3>
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={`${t.fullName} *`}
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder={`${t.phoneNumber} *`}
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <input
                  type="text"
                  placeholder={`${t.addressLine1} *`}
                  value={shippingAddress.address_line1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder={t.addressLine2}
                  value={shippingAddress.address_line2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={`${t.city} *`}
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={`${t.district} *`}
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={`${t.state} *`}
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={`${t.pincode} *`}
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <textarea
                  placeholder={t.orderNotes}
                  value={orderForm.buyer_notes}
                  onChange={(e) => setOrderForm({ ...orderForm, buyer_notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t.totalAmount}:</span>
                  <span className="text-green-600">₹{(selectedProduct.price * orderForm.quantity).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!orderForm.quantity || !shippingAddress.name || !shippingAddress.phone || 
                           !shippingAddress.address_line1 || !shippingAddress.city || 
                           !shippingAddress.district || !shippingAddress.pincode}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {t.proceedToPayment}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && orderData && !paymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{t.completePayment}</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                clientSecret={orderData.client_secret}
                totalAmount={orderData.total_price}
                orderNumber={orderData.order_number}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowPaymentModal(false);
                  setOrderData(null);
                }}
                t={t}
              />
            </Elements>
          </div>
        </div>
      )}

      {paymentSuccess && orderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.paymentSuccessful}</h2>
              <p className="text-gray-600 mb-4">{t.order} #{orderData.order_number}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t.deliveryInformation}
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>{t.name}:</strong> {shippingAddress.name}</p>
                  <p><strong>{t.phone}:</strong> {shippingAddress.phone}</p>
                  <p><strong>{t.address}:</strong></p>
                  <p>{shippingAddress.address_line1}</p>
                  {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.district}</p>
                  <p>{shippingAddress.state} - {shippingAddress.pincode}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✅ {t.sellerContact}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    fetchMyOrders();
                    setShowPaymentModal(false);
                    setPaymentSuccess(false);
                    setSelectedProduct(null);
                    resetOrderForm();
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  {t.viewMyOrders}
                </button>
                <button
                  onClick={() => {
                    setActiveView('marketplace');
                    setShowPaymentModal(false);
                    setPaymentSuccess(false);
                    setSelectedProduct(null);
                    resetOrderForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  {t.continueShopping}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;