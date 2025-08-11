// Helper to get/set cookies
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}
// Render the QR result container with improved look
function renderQRResult({ content, imageUrl, isUrl, extra = '' }) {
    const contentHtml = isUrl
        ? `<a href="${content}" target="_blank" rel="noopener noreferrer">${content}</a>`
        : `<strong>${content}</strong>`;
    const label = isUrl ? 'Link' : 'Text';
    return `
        <div class="result-container">
        <div class="result-title">QR Code detected!</div>
            <img src="${imageUrl}" class="detected-image" alt="Detected QR Code">
            <div>
                <div class="result-content">${contentHtml}</div>
                ${extra ? `<div class="result-extra">${extra}</div>` : ''}
            </div>
        </div>
    `;
}
// Wait for jsQR to load
function ensureJsQRLoaded() {
    return new Promise((resolve) => {
        if (window.jsQR) {
            resolve();
        } else {
            window.addEventListener('load', function checkJsQR() {
                if (window.jsQR) {
                    window.removeEventListener('load', checkJsQR);
                    resolve();
                }
            });
        }
    });
}

// Theme handling
function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    themeToggle.innerHTML = isDark ? 
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>` : 
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
        </svg>`;
    
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `theme=${isDark ? 'dark' : 'light'}; expires=${expiryDate.toUTCString()}; path=/`;
}

function loadTheme() {
    const theme = document.cookie.split('; ').find(row => row.startsWith('theme='));
    if (theme) {
        setTheme(theme.split('=')[1] === 'dark');
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark);
    }
}

// showLinkConfirmation removed; links will open directly

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

function showResult(message, isSuccess = true) {
    result.innerHTML = message;
    result.className = isSuccess ? 'success' : 'error';
    
    result.style.opacity = '0.7';
    setTimeout(() => {
        result.style.opacity = '1';
    }, 100);
}

async function handleQRContent(content, imageUrl) {
    const isUrl = isValidUrl(content);
    showResult(renderQRResult({ content, imageUrl, isUrl }), true);
    const autoActionCheckbox = document.getElementById('autoAction');
    if (autoActionCheckbox.checked) {
        if (isUrl) {
            window.open(content, '_blank');
            showResult(renderQRResult({ content, imageUrl, isUrl, extra: '(Link opened in new tab)' }), true);
        } else {
            const copied = await copyToClipboard(content);
            if (copied) {
                result.classList.add('copied');
                showResult(renderQRResult({ content, imageUrl, isUrl, extra: '(Copied to clipboard!)' }), true);
                setTimeout(() => result.classList.remove('copied'), 1500);
            }
        }
    }

    setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
    }, 1000);
}

async function processImage(imageBlob) {
    await ensureJsQRLoaded();
    const imageUrl = URL.createObjectURL(imageBlob);
    const img = new Image();
    
    img.onload = () => {
        const canvas = document.getElementById('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
            handleQRContent(code.data, imageUrl);
        } else {
            showResult('No QR code found in the image', false);
            URL.revokeObjectURL(imageUrl);
        }
    };
    
    img.src = imageUrl;
}

// Initialize analytics through service worker
const initAnalytics = () => {
  if ('serviceWorker' in navigator) {
    // Basic GA data structure
    window.dataLayer = window.dataLayer || [];
    function gtag(){
      const data = arguments;
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'GA_DATA',
          payload: {
            v: '2',  // GA4 version
            tid: 'G-G3DB3NVECG',
            cid: getCid(),  // Get client ID
            t: data[0],
            dl: window.location.href,
            dr: document.referrer,
            dt: document.title,
            ul: navigator.language,
            ...formatGtagData(data)
          }
        });
      }
    }
    window.gtag = gtag;

    // Initialize
    gtag('js', new Date());
    gtag('config', 'G-G3DB3NVECG', {
      'send_page_view': true,
      'transport_type': 'beacon'
    });
  }
};

// Helper to get/generate client ID
const getCid = () => {
  let cid = localStorage.getItem('ga_client_id');
  if (!cid) {
    cid = crypto.randomUUID();
    localStorage.setItem('ga_client_id', cid);
  }
  return cid;
};

// Helper to format gtag data
const formatGtagData = (data) => {
  // Convert gtag format to Measurement Protocol
  // This is a basic implementation
  const formatted = {};
  if (Array.isArray(data)) {
    if (data[0] === 'event') {
      formatted.en = data[1];
      if (data[2]) {
        Object.entries(data[2]).forEach(([key, value]) => {
          formatted[`ep.${key}`] = value;
        });
      }
    }
  }
  return formatted;
};

// Initialize when ready
if (document.readyState === 'complete') {
  initAnalytics();
} else {
  window.addEventListener('load', initAnalytics);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();

    // Manage autoActionCheckbox state from cookies
    const autoActionCheckbox = document.getElementById('autoAction');
    const autoActionCookie = getCookie('autoAction');
    if (autoActionCheckbox) {
        autoActionCheckbox.checked = autoActionCookie === '1';
        autoActionCheckbox.addEventListener('change', () => {
            setCookie('autoAction', autoActionCheckbox.checked ? '1' : '0');
        });
    }

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!document.cookie.includes('theme=')) {
            setTheme(e.matches);
        }
    });

    // Paste handler
    document.addEventListener('paste', async (event) => {
        event.preventDefault();
        const items = event.clipboardData.items;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                await processImage(blob);
                return;
            }
        }
        showResult('No image found in clipboard. Please copy an image first.', false);
    });
});