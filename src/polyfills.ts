import { Buffer } from 'buffer';

// Polyfill global for simple-peer
if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
}

// Polyfill Buffer for simple-peer
if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = Buffer;
}
