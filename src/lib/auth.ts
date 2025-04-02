function loadGoogleScript() {
    return new Promise<void>((resolve, reject) => {
        console.log('[loadGoogleScript] Starting to load Google script');
        
        if (window.google) {
            console.log('[loadGoogleScript] Script already initialized');
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        
        script.onload = () => {
            console.log('[loadGoogleScript] Script loaded successfully');
            resolve();
        };
        
        script.onerror = (error) => {
            console.error('[loadGoogleScript] Error loading script:', error);
            reject(error);
        };
        
        document.head.appendChild(script);
    });
};
    
function handleCredentialResponse(response: any) {
    console.log('Google response received:', response);
    // Here you can handle the response by sending it to your backend
    // For now, we'll just log it
}

// kudos: https://github.com/better-auth/better-auth/pull/1452
export async function initializeGoogle() {
    try {
        // await loadGoogleScript();
        
        google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GAPI_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin'
        });
        
        // Initialize One Tap prompt
        google.accounts.id.prompt();
    } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
    }
}

