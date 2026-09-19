# Vendored QR generator

Project Nayuki QR Code generator, tag **v1.8.0**, MIT license. Source:
https://github.com/nayuki/QR-Code-generator/blob/v1.8.0/typescript-javascript/qrcodegen.ts

`qrcodegen.js` is that TypeScript source transformed to ES2020 JavaScript with esbuild, with `export { qrcodegen }` appended. The algorithm is unmodified. The source's full license is retained in `LICENSE.txt`. No CDN or QR service is used: the browser generates a module matrix and the instructor page renders a black/white SVG with a four-module quiet zone. The encoded value contains only the permanent student link.
