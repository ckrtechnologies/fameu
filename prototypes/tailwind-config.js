tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#E3B04B',
        primaryPressed: '#C8952B',
        secondary: '#5B6FA8',
        background: '#0E0F12',
        surface: '#17191F',
        surfaceAlt: '#1F222A',
        textPrimary: '#F4F2EE',
        textSecondary: '#A6ABB3',
        textDisabled: '#5A5E66',
        textOnPrimary: '#1A1200',
        border: '#2C2F38',
        success: '#4CAF6E',
        successBg: '#17281C',
        warning: '#E3B04B',
        warningBg: '#2A2413',
        error: '#E76A6A',
        errorBg: '#2A1717',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', '40px'],
        'h1': ['24px', '32px'],
        'h2': ['20px', '28px'],
        'h3': ['17px', '24px'],
        'body': ['15px', '22px'],
        'bodyBold': ['15px', '22px'],
        'caption': ['13px', '18px'],
        'overline': ['11px', '14px'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'full': '9999px',
      }
    }
  }
}
