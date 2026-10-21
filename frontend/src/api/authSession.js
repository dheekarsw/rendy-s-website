// Session-only bearer token. Never store the admin password in the browser.
const KEY = 'portfolio_admin_access_token'
export function getToken() {
  try { return window.sessionStorage.getItem(KEY) || '' } catch { return '' }
}
export function storeToken(value) {
  try {
    if (value) window.sessionStorage.setItem(KEY, value)
    else window.sessionStorage.removeItem(KEY)
  } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event('portfolio-auth-change'))
}
