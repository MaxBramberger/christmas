import { Injectable } from "@angular/core";
import {MESSAGES} from "./initial-store";

type StoredValue = {
    iv: Uint8Array;
    ciphertext: ArrayBuffer;
};

export type ExportedEntry = {
    key: string;
    value: {
        iv: string;          // base64
        ciphertext: string; // base64
    };
};

@Injectable({ providedIn: "root" })
export class EncryptedKVStoreService {
    private crypto = window.crypto;
    private store = new Map<string, StoredValue>();

    /* ---------- Public API ---------- */

    constructor() {
        this.importFromJson(MESSAGES);
    }

    async put(message: string): Promise<string> {
        const msgBytes = this.toBytes(message);

        // single hash (used as AES key)
        const hash = await this.sha256(msgBytes);

        // double hash (used as store key)
        const storeKey = await this.sha256Hex(hash);

        const cryptoKey = await this.importAesKey(hash);
        const iv = this.crypto.getRandomValues(new Uint8Array(12));

        const ciphertext = await this.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            cryptoKey,
            msgBytes
        );

        this.store.set(storeKey, { iv, ciphertext });

        // return single-hash hex for later retrieval
        return this.bytesToHex(hash);
    }

    async getFromHashHex(hashHex: string): Promise<string | null> {
        const hash = Uint8Array.from(
            hashHex.match(/.{2}/g)!.map(b => parseInt(b, 16))
        );
        return this.get(hash);
    }

    async get(messageHash: Uint8Array): Promise<string | null> {
        const storeKey = await this.sha256Hex(messageHash);

        const record = this.store.get(storeKey);
        if (!record) return null;

        const cryptoKey = await this.importAesKey(messageHash);

        const plaintext = await this.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: record.iv },
            cryptoKey,
            record.ciphertext
        );

        return this.fromBytes(new Uint8Array(plaintext));
    }

    /* ---------- JSON Export / Import ---------- */

    exportToJson(): ExportedEntry[] {
        return Array.from(this.store.entries()).map(([key, value]) => ({
            key,
            value: {
                iv: this.toBase64(value.iv),
                ciphertext: this.toBase64(new Uint8Array(value.ciphertext))
            }
        }));
    }

    importFromJson(data: ExportedEntry[]): void {
        this.store.clear();

        for (const entry of data) {
            this.store.set(entry.key, {
                iv: this.fromBase64(entry.value.iv),
                ciphertext: this.fromBase64(entry.value.ciphertext).buffer
            });
        }
    }

    /* ---------- Crypto helpers ---------- */

    private async sha256(data: Uint8Array): Promise<Uint8Array> {
        const hash = await this.crypto.subtle.digest("SHA-256", data);
        return new Uint8Array(hash);
    }

    private async sha256Hex(data: Uint8Array): Promise<string> {
        const hash = await this.crypto.subtle.digest("SHA-256", data);
        return [...new Uint8Array(hash)]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    private async importAesKey(keyBytes: Uint8Array): Promise<CryptoKey> {
        return this.crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }

    /* ---------- Encoding helpers ---------- */

    private toBytes(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }

    private fromBytes(bytes: Uint8Array): string {
        return new TextDecoder().decode(bytes);
    }

    private toBase64(bytes: Uint8Array): string {
        return btoa(String.fromCharCode(...bytes));
    }

    private fromBase64(base64: string): Uint8Array {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }

    private bytesToHex(bytes: Uint8Array): string {
        return [...bytes]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    private hexToBytes(hex: string): Uint8Array {
        return Uint8Array.from(
            hex.match(/.{2}/g)!.map(b => parseInt(b, 16))
        );
    }
}
