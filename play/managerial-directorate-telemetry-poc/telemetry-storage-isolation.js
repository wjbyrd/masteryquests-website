(function isolatePrivateBuildStorage(){
  "use strict";
  const namespace = "mq:managerial-directorate-telemetry-poc:";
  let nativeStorage;
  try { nativeStorage = window.localStorage; } catch (_) { return; }
  if (!nativeStorage || window.__MQ_PRIVATE_STORAGE_ISOLATED__) return;

  const native = {
    getItem: nativeStorage.getItem.bind(nativeStorage),
    setItem: nativeStorage.setItem.bind(nativeStorage),
    removeItem: nativeStorage.removeItem.bind(nativeStorage),
    key: nativeStorage.key.bind(nativeStorage),
    clear: nativeStorage.clear.bind(nativeStorage)
  };
  const scopedKey = key => namespace + String(key);
  const visibleKeys = () => {
    const keys = [];
    for (let index = 0; index < nativeStorage.length; index += 1) {
      const key = native.key(index);
      if (key && key.startsWith(namespace)) keys.push(key.slice(namespace.length));
    }
    return keys;
  };

  const privateStorage = new Proxy(nativeStorage, {
    get(_target, property) {
      if (property === "getItem") return key => native.getItem(scopedKey(key));
      if (property === "setItem") return (key, value) => native.setItem(scopedKey(key), String(value));
      if (property === "removeItem") return key => native.removeItem(scopedKey(key));
      if (property === "key") return index => visibleKeys()[Number(index)] ?? null;
      if (property === "clear") return () => visibleKeys().forEach(key => native.removeItem(scopedKey(key)));
      if (property === "length") return visibleKeys().length;
      const value = Reflect.get(nativeStorage, property, nativeStorage);
      return typeof value === "function" ? value.bind(nativeStorage) : value;
    },
    ownKeys() { return visibleKeys(); },
    getOwnPropertyDescriptor(_target, property) {
      if (visibleKeys().includes(String(property))) {
        return { configurable: true, enumerable: true, value: native.getItem(scopedKey(property)), writable: true };
      }
      return undefined;
    },
    has(_target, property) { return visibleKeys().includes(String(property)); }
  });

  try {
    Object.defineProperty(window, "localStorage", { configurable: false, enumerable: true, value: privateStorage });
    window.__MQ_PRIVATE_STORAGE_ISOLATED__ = true;
    window.__MQ_PRIVATE_STORAGE_NAMESPACE__ = namespace;
  } catch (_) {
    // Storage isolation is defense-in-depth; failure must never block gameplay.
  }
})();
