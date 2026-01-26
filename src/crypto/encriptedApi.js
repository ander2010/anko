// ---------- base64url helpers ----------
function b64urlToBytes(b64url) {
    const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
    const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
    const binStr = atob(b64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    return bytes;
}

async function sha256Bytes(str) {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuf = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hashBuf);
}

async function importAesGcmKeyFromToken(token) {
    const keyBytes = await sha256Bytes(token); // 32 bytes
    return crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );
}

export async function decryptEnvelope(envelope, token) {
    // envelope: {v, alg, nonce, ciphertext}
    // Updated: alg and v are optional to save bandwidth
    if (!envelope || !envelope.nonce || !envelope.ciphertext) {
        throw new Error("Invalid encrypted envelope (missing nonce or ciphertext)");
    }

    const key = await importAesGcmKeyFromToken(token);
    const nonce = b64urlToBytes(envelope.nonce);
    const ciphertext = b64urlToBytes(envelope.ciphertext);

    const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: nonce },
        key,
        ciphertext
    );

    const plainText = new TextDecoder().decode(new Uint8Array(plainBuf));
    return JSON.parse(plainText);
}

// ---------- fetch wrapper ----------
export async function apiFetch(url, { token, ...options } = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Token ${token}`);
    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, { ...options, headers });

    // si no es json, devuelve normal
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return { ok: res.ok, status: res.status, data: await res.text() };
    }

    const json = await res.json();

    // Detecta envelope cifrado (alg and v are now optional)
    const isEncrypted =
        json &&
        typeof json === "object" &&
        typeof json.nonce === "string" &&
        typeof json.ciphertext === "string";

    if (!isEncrypted) {
        return { ok: res.ok, status: res.status, data: json };
    }

    if (!token) {
        throw new Error("Encrypted response received but no token provided");
    }

    const decrypted = await decryptEnvelope(json, token);
    // backend envuelve {data: ...}
    return { ok: res.ok, status: res.status, data: decrypted.data };
}
