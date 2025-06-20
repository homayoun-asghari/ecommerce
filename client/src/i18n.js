import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'tr'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    resources: {
      en: {
        translation: {
          // Common
          welcome: 'Welcome',
          logout: 'Log Out',
          login: 'Log In',
          signup: 'Sign Up',
          search: 'Search',
          cart: 'Cart',
          price: 'Price',
          quantity: 'Quantity',
          total: 'Total',
          subtotal: 'Subtotal',
          checkout: 'Checkout',
          continueShopping: 'Continue Shopping',
          
          // Navigation
          home: 'Home',
          products: 'Products',
          categories: 'Categories',
          about: 'About Us',
          contact: 'Contact',
          
          // Product
          addToCart: 'Add to Cart',
          inStock: 'In Stock',
          outOfStock: 'Out of Stock',
          productDetails: 'Product Details',
          relatedProducts: 'Related Products',
          
          // Cart
          yourCart: 'Your Cart',
          emptyCart: 'Your cart is empty',
          remove: 'Remove',
          
          // Checkout
          shippingInfo: 'Shipping Information',
          paymentMethod: 'Payment Method',
          placeOrder: 'Place Order',
          
          // Forms
          name: 'Name',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          address: 'Address',
          city: 'City',
          country: 'Country',
          zipCode: 'ZIP Code',
          phone: 'Phone',
          
          // Messages
          addedToCart: 'Added to cart',
          orderPlaced: 'Your order has been placed!',
          thankYou: 'Thank you for your purchase!',
          loading: 'Loading...',
          error: 'An error occurred',
        },
      },
      tr: {
        translation: {
          // Common
          welcome: 'Hoş Geldiniz',
          logout: 'Çıkış Yap',
          login: 'Giriş Yap',
          signup: 'Kayıt Ol',
          search: 'Ara',
          cart: 'Sepet',
          price: 'Fiyat',
          quantity: 'Adet',
          total: 'Toplam',
          subtotal: 'Ara Toplam',
          checkout: 'Ödemeye Geç',
          continueShopping: 'Alışverişe Devam Et',
          
          // Navigation
          home: 'Ana Sayfa',
          products: 'Ürünler',
          categories: 'Kategoriler',
          about: 'Hakkımızda',
          contact: 'İletişim',
          
          // Product
          addToCart: 'Sepete Ekle',
          inStock: 'Stokta Var',
          outOfStock: 'Stokta Yok',
          productDetails: 'Ürün Detayları',
          relatedProducts: 'Benzer Ürünler',
          
          // Cart
          yourCart: 'Sepetiniz',
          emptyCart: 'Sepetiniz boş',
          remove: 'Kaldır',
          
          // Checkout
          shippingInfo: 'Teslimat Bilgileri',
          paymentMethod: 'Ödeme Yöntemi',
          placeOrder: 'Siparişi Tamamla',
          
          // Forms
          name: 'Ad Soyad',
          email: 'E-posta',
          password: 'Şifre',
          confirmPassword: 'Şifreyi Onayla',
          address: 'Adres',
          city: 'Şehir',
          country: 'Ülke',
          zipCode: 'Posta Kodu',
          phone: 'Telefon',
          
          // Messages
          addedToCart: 'Sepete eklendi',
          orderPlaced: 'Siparişiniz alındı!',
          thankYou: 'Alışverişiniz için teşekkür ederiz!',
          loading: 'Yükleniyor...',
          error: 'Bir hata oluştu',
        },
      },
    },
  });

export default i18n;
