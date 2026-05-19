// Messenger Customer Chat - widget chat live cho khách hàng.
// Tự load SDK Facebook khi có VITE_FB_PAGE_ID. Không có ID → không render gì.
// Doc: https://developers.facebook.com/docs/messenger-platform/discovery/customer-chat-plugin/

import { useEffect } from 'react';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: { XFBML?: { parse: (el?: HTMLElement) => void } };
  }
}

export default function MessengerChat() {
  const pageId = import.meta.env.VITE_FB_PAGE_ID as string | undefined;
  const themeColor = import.meta.env.VITE_FB_THEME_COLOR as string | undefined;
  const greetingLogged = import.meta.env.VITE_FB_GREETING_LOGGED as string | undefined;
  const greetingGuest = import.meta.env.VITE_FB_GREETING_GUEST as string | undefined;

  useEffect(() => {
    if (!pageId) return;
    if (typeof window === 'undefined') return;

    // Avoid double-init
    if (document.getElementById('fb-customer-chat-script')) return;

    // FB root element
    if (!document.getElementById('fb-root')) {
      const root = document.createElement('div');
      root.id = 'fb-root';
      document.body.appendChild(root);
    }

    // Customer chat element
    if (!document.getElementById('fb-customer-chat')) {
      const div = document.createElement('div');
      div.id = 'fb-customer-chat';
      div.className = 'fb-customerchat';
      div.setAttribute('attribution', 'biz_inbox');
      div.setAttribute('page_id', pageId);
      if (themeColor) div.setAttribute('theme_color', themeColor);
      if (greetingLogged) div.setAttribute('logged_in_greeting', greetingLogged);
      if (greetingGuest) div.setAttribute('logged_out_greeting', greetingGuest);
      document.body.appendChild(div);
    }

    window.fbAsyncInit = () => {
      // FB.XFBML.parse() để render widget sau khi SDK load
      window.FB?.XFBML?.parse?.();
    };

    const script = document.createElement('script');
    script.id = 'fb-customer-chat-script';
    script.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      // Không gỡ widget khi unmount để tránh re-init khi navigate.
    };
  }, [pageId, themeColor, greetingLogged, greetingGuest]);

  return null;
}
