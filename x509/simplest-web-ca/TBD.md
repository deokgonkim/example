# TBD — Known Issues & Future Work

## 🔴 Direct Browser Certificate Installation Not Working

**Status:** Unresolved  
**Added:** 2026-04-02

### What was attempted
After assembling the PKCS#12 (`.p12`) bundle client-side, the browser is navigated to a `blob:` URL
with `Content-Type: application/x-pkcs12`, which is supposed to trigger the browser's native
certificate import dialog instead of saving a file.

```js
const p12Blob = new Blob([p12Bytes], { type: 'application/x-pkcs12' });
window.location.href = URL.createObjectURL(p12Blob);
```

### Expected behavior
- **Firefox** → opens "Password for Certificate Backup" dialog and imports to its cert store
- **Chrome/Edge (Windows)** → opens Windows Certificate Import Wizard
- **Chrome/Edge (macOS)** → opens Keychain Access
- **Safari/macOS** → opens Keychain Access

### Actual behavior
Browser treats it as a file download or does nothing, depending on platform/version.

### Possible directions to investigate
- Try navigating via an `<iframe>` or `<a>` click (without `download` attribute) instead of `window.location.href`
- Serve the `.p12` from the **server** with `Content-Type: application/x-pkcs12` and no `Content-Disposition` header;
  have the client POST the assembled `.p12` bytes to a one-time server endpoint that echoes them back with the right headers
- Investigate `navigator.credentials` / Web Authentication API — not directly applicable for X.509 but worth reviewing
- Check if the deprecated `<keygen>` + `application/x-x509-user-cert` approach has any modern equivalent
- Test platform-specific behavior (Firefox seems most likely to work; Chrome defers to OS dialogs)

### Current workaround
The fallback "save as file" link in the success message lets users download `smime.p12` and import
it manually using the browser import guide shown below it.
