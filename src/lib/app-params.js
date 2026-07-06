const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) return searchParam;
  if (defaultValue) return defaultValue;
  const storedValue = localStorage.getItem(paramName);
  return storedValue || null;
};

const getAppParams = () => {
  return {
    appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_APP_ID }),
    serverUrl: getAppParamValue("server_url", { defaultValue: import.meta.env.VITE_API_URL }),
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
  }
}

export const appParams = {
  ...getAppParams()
}
