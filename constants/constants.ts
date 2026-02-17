const SCRIPT_URL = `${process.env.NEXT_PUBLIC_APP_URL}/js/pixel.js`
export const getScript = (domain: string, siteId: string) => {
  return `<script data-domain="${domain}"
data-site-id="${siteId}" src="${SCRIPT_URL}" defer></script>`;
}