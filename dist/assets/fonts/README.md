# Montserrat

The application uses Montserrat normal weights 400, 500, 600 and 700 from the pinned `@fontsource/montserrat` 5.2.6 package. Copyright belongs to the Montserrat project authors. The SIL Open Font License is included in `OFL.txt`; font files must retain their original license/embedded notices.

This supplied build downloads the four unmodified Latin WOFF2 assets directly from jsDelivr on the first online launch, with credentials omitted. It stores their bytes in the browser's `better-solar-fonts-v1` Cache Storage and loads them through the native FontFace API. Later offline launches use the cache. No academic records, profile fields or Canvas feed URLs are included in font requests. Until this first download succeeds, the browser uses its sans-serif fallback. Settings reports whether the fonts are ready.

The build environment blocked external binary font downloads, so this package does not claim to contain downloaded Montserrat binaries. For a completely self-contained font package, run:

```sh
npm run fonts
npm run build
```

The vendor script downloads and validates the four fonts and the matching package license, stores only these public assets in this folder, and changes `src/font-assets.js` to use bundled fonts. This is separate from scraped data; it never exports student records. Once bundled, no font-server request is needed, including on the first launch.

Sources:
- https://fontsource.org/fonts/montserrat
- https://github.com/JulietaUla/Montserrat
- https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.2.6/
