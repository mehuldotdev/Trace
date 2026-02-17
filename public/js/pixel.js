(function () {
  if (typeof window === "undefined") {
    console.log("Not in a window environment")
    return;
  }

  const script = document.currentScript;

  const domain = script?.getAttribute("data-domain")
  const siteId = script?.getAttribute("data-site-id")

  if (!domain && !siteId) return

  const ENDPOINT = `${window.location.origin}/api/auth/collect`

  const generateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`
  }

  const VISITOR_KEY = "_px_vid"
  const SESSION_KEY = "_px_sid"
  let visitorId;
  let sessionId;

  try {
    visitorId = localStorage.getItem(VISITOR_KEY) || generateId()
    localStorage.setItem(VISITOR_KEY, visitorId)

    sessionId = sessionStorage.getItem(SESSION_KEY) || generateId()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  } catch (error) {
    visitorId = generateId()
    sessionId = generateId()
  }


  let activeStart = performance.now()


  let activeTime = 0

  let heartbeat = null


  // UTM_Source
  const params = new URLSearchParams(location.search)
  const utm_source = params.get("utm_source");
  const utm_campaign = params.get("utm_campaign");

  const payload = (type, extra = {}) => JSON.stringify({
    type,
    domain,
    siteId,
    visitorId,
    sessionId,
    url: location.href,
    referrer: document.referrer || null,
    screenWidth: screen.width,
    userAgent: navigator.userAgent,
    utm_campaign,
    utm_source,
    timestamp: Date.now(),
    ...extra
  })

  const sendEvent = (type, extra) => {
    fetch(ENDPOINT, {
      method: "POST",
      body: payload(type, extra),
      headers: {
        "Content-Type":"application/json"
      },
      keepalive:true
    }).catch(() => {})
  }

  const sendExit = () => {
    activeTime += performance.now() - activeStart;

    sendEvent("page_exit", {
      active_time: Math.round(activeTime),
    })
  }

  const startHeartbeat = () => {
    if (!heartbeat) {
      heartbeat = setInterval(() => sendEvent("heartbeat"),
        10000)
    }
  }

  const stopHeatbeat = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null
    }
  }


  sendEvent("page_view");
  startHeartbeat() // track live visitor for every 60 seconds


  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      activeTime += performance.now() - activeStart;
      stopHeatbeat()
    } else {
      activeStart = performance.now()
      startHeartbeat()
    }
  })


 window.addEventListener("pagehide", sendExit)

})()