(function(root, factory){
  const api = factory(root.MQFacultyComposerCore || (typeof require === 'function' ? require('./composer-core.js') : null));
  if(typeof module === 'object' && module.exports) module.exports = api;
  root.MQFacultyCustomAssets = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(Core){
  'use strict';

  const POLICY = Core?.CUSTOM_ASSET_POLICY || {
    allowedSourceTypes:['image/webp','image/png','image/jpeg'], maxSourceBytes:12582912,
    maxNormalizedBytes:6291456, maxTotalBytes:25165824, maxDimension:8192,
    maxPixels:40000000, sceneLongEdge:2560, objectLongEdge:2048, webpQuality:0.9
  };

  function facultyError(message, code){
    const error = new Error(message);
    error.code = code;
    error.facultyMessage = message;
    return error;
  }

  function sniffMime(bytes){
    if(bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
    if(bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if(bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
    return '';
  }

  function bytesToBase64(bytes){
    let binary = '';
    const chunk = 0x8000;
    for(let index = 0; index < bytes.length; index += chunk){
      binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunk, bytes.length)));
    }
    return btoa(binary);
  }

  function base64ToBytes(value){
    try{
      const binary = atob(String(value || ''));
      const bytes = new Uint8Array(binary.length);
      for(let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
      return bytes;
    } catch(error){
      throw facultyError('This saved custom image is damaged and cannot be restored.', 'invalid-base64');
    }
  }

  function parseDataUrl(dataUrl){
    const match = /^data:(image\/(?:webp|png|jpeg));base64,([a-z0-9+/=\s]+)$/i.exec(String(dataUrl || ''));
    if(!match) throw facultyError('This saved custom image has an unsupported or damaged format.', 'invalid-data-url');
    return {fileType:match[1].toLowerCase(), bytes:base64ToBytes(match[2].replace(/\s/g, ''))};
  }

  async function sha256Hex(bytes){
    const subtle = globalThis.crypto?.subtle;
    if(!subtle) throw facultyError('This browser cannot verify image integrity.', 'crypto-unavailable');
    const digest = await subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  }

  function validateSourceBytes(bytes, declaredType = ''){
    if(!bytes.length) throw facultyError('This file is empty. Choose a WebP, PNG, or JPEG image.', 'empty-file');
    if(bytes.length > POLICY.maxSourceBytes) throw facultyError(`This file is too large to package safely. Choose an image under ${Math.round(POLICY.maxSourceBytes / 1048576)} MB.`, 'source-too-large');
    const actualType = sniffMime(bytes);
    if(!actualType) throw facultyError('This file is not a supported WebP, PNG, or JPEG image.', 'unsupported-signature');
    const claimed = String(declaredType || '').toLowerCase();
    if(claimed && !POLICY.allowedSourceTypes.includes(claimed)) throw facultyError('Choose a WebP, PNG, or JPEG image. SVG, GIF, and other file types are not supported.', 'unsupported-type');
    if(claimed && claimed !== actualType) throw facultyError('This file does not match its reported image format. Choose the original WebP, PNG, or JPEG file.', 'type-mismatch');
    return actualType;
  }

  function validateDimensions(width, height){
    if(!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw facultyError('This image could not be decoded. Choose a valid image file.', 'invalid-dimensions');
    if(width > POLICY.maxDimension || height > POLICY.maxDimension) throw facultyError(`This image is too large to process safely. Each side must be ${POLICY.maxDimension.toLocaleString()} pixels or less.`, 'dimension-limit');
    if(width * height > POLICY.maxPixels) throw facultyError(`This image has too many pixels to process safely. Choose an image under ${Math.round(POLICY.maxPixels / 1000000)} megapixels.`, 'pixel-limit');
  }

  function slotFitWarnings(width, height, slotDefinition = {}){
    const warnings = [];
    const ratio = width / height;
    const geometry = slotDefinition.aspectRatio || '16:9';
    if(geometry === '16:9'){
      if(width < 960 || height < 540) warnings.push(`This image is only ${width} x ${height} pixels and may appear blurry in a wide visual slot.`);
      if(ratio < 1.2) warnings.push(`This image is narrow for ${slotDefinition.label || 'this wide slot'} and may crop heavily.`);
      if(ratio > 2.4) warnings.push(`This image is unusually wide for ${slotDefinition.label || 'this slot'} and may crop heavily.`);
    } else if(geometry === 'portrait-or-square'){
      if(Math.max(width, height) < 700) warnings.push(`This image is only ${width} x ${height} pixels and may appear blurry.`);
      if(ratio > 1.5) warnings.push(`This image is wide for ${slotDefinition.label || 'this character slot'} and may crop at the sides.`);
      if(ratio < 0.45) warnings.push(`This image is very tall and may crop at the top or bottom.`);
    } else {
      if(Math.min(width, height) < 600) warnings.push(`This image is only ${width} x ${height} pixels and may appear blurry.`);
      if(ratio < 0.7 || ratio > 1.4) warnings.push(`This image is not close to square and may crop in ${slotDefinition.label || 'this reward slot'}.`);
    }
    return warnings;
  }

  async function decodeBlob(blob){
    if(typeof createImageBitmap === 'function'){
      try{
        const bitmap = await createImageBitmap(blob);
        return {source:bitmap, width:bitmap.width, height:bitmap.height, close:() => bitmap.close()};
      } catch(error){
        throw facultyError('This image could not be decoded. It may be malformed or incomplete.', 'decode-failed');
      }
    }
    if(typeof Image === 'undefined' || !globalThis.URL?.createObjectURL) throw facultyError('This browser cannot process local images.', 'decode-unavailable');
    const url = URL.createObjectURL(blob);
    try{
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      return {source:image, width:image.naturalWidth, height:image.naturalHeight, close:() => URL.revokeObjectURL(url)};
    } catch(error){
      URL.revokeObjectURL(url);
      throw facultyError('This image could not be decoded. It may be malformed or incomplete.', 'decode-failed');
    }
  }

  function canvasBlob(canvas, type, quality){
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
  }

  async function normalizeDecoded(decoded, slotDefinition){
    if(typeof document === 'undefined') throw facultyError('Image normalization requires a modern browser.', 'canvas-unavailable');
    const geometry = slotDefinition?.aspectRatio || '16:9';
    const longEdge = geometry === '16:9' ? POLICY.sceneLongEdge : POLICY.objectLongEdge;
    const scale = Math.min(1, longEdge / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', {alpha:true});
    if(!context) throw facultyError('This browser could not prepare the image for the game.', 'canvas-unavailable');
    context.drawImage(decoded.source, 0, 0, width, height);
    let blob = await canvasBlob(canvas, 'image/webp', POLICY.webpQuality);
    if(!blob || blob.type !== 'image/webp') blob = await canvasBlob(canvas, 'image/png');
    if(!blob) throw facultyError('This browser could not prepare the image for the game.', 'encode-failed');
    if(blob.size > POLICY.maxNormalizedBytes) throw facultyError(`The game-ready image is still too large. Choose a simpler or smaller image under ${Math.round(POLICY.maxNormalizedBytes / 1048576)} MB.`, 'normalized-too-large');
    return {blob, width, height};
  }

  async function processFile(file, slotId, slotDefinition){
    const originalBytes = new Uint8Array(await file.arrayBuffer());
    const actualType = validateSourceBytes(originalBytes, file.type);
    const decoded = await decodeBlob(new Blob([originalBytes], {type:actualType}));
    try{
      validateDimensions(decoded.width, decoded.height);
      const warnings = slotFitWarnings(decoded.width, decoded.height, slotDefinition);
      const normalized = await normalizeDecoded(decoded, slotDefinition);
      const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
      const fileType = sniffMime(bytes);
      if(fileType !== normalized.blob.type) throw facultyError('The browser produced an unexpected image format.', 'encode-mismatch');
      const sha256 = await sha256Hex(bytes);
      return {
        record:{
          id:`faculty-${sha256.slice(0, 24)}`,
          label:'Custom image',
          originalName:String(file.name || 'Custom image').slice(0, 180),
          category:'theme-custom',
          fileType,
          width:normalized.width,
          height:normalized.height,
          originalWidth:decoded.width,
          originalHeight:decoded.height,
          originalSizeBytes:originalBytes.length,
          sizeBytes:bytes.length,
          sha256,
          dataUrl:`data:${fileType};base64,${bytesToBase64(bytes)}`,
          compatibleSlots:[slotId],
          normalized:true
        },
        warnings,
        originalType:actualType
      };
    } finally {
      decoded.close();
    }
  }

  async function verifyRecordBytes(record){
    try{
      const parsed = parseDataUrl(record?.dataUrl);
      if(parsed.fileType !== record.fileType || sniffMime(parsed.bytes) !== record.fileType) throw facultyError('This saved custom image has a format mismatch.', 'record-type-mismatch');
      if(parsed.bytes.length !== record.sizeBytes || parsed.bytes.length > POLICY.maxNormalizedBytes) throw facultyError('This saved custom image has an unexpected file size.', 'record-size-mismatch');
      if(await sha256Hex(parsed.bytes) !== String(record.sha256 || '').toLowerCase()) throw facultyError('This saved custom image failed its integrity check.', 'record-hash-mismatch');
      return {ok:true, bytes:parsed.bytes, fileType:parsed.fileType};
    } catch(error){
      return {ok:false, error:error.facultyMessage || 'This saved custom image is damaged and cannot be restored.', code:error.code || 'record-invalid'};
    }
  }

  async function verifyRecord(record){
    try{
      const byteCheck = await verifyRecordBytes(record);
      if(!byteCheck.ok) return byteCheck;
      const parsed = byteCheck;
      const decoded = await decodeBlob(new Blob([parsed.bytes], {type:parsed.fileType}));
      try{
        validateDimensions(decoded.width, decoded.height);
        if(decoded.width !== record.width || decoded.height !== record.height) throw facultyError('This saved custom image has unexpected dimensions.', 'record-dimension-mismatch');
      } finally {
        decoded.close();
      }
      return {ok:true, bytes:parsed.bytes};
    } catch(error){
      return {ok:false, error:error.facultyMessage || 'This saved custom image is damaged and cannot be restored.', code:error.code || 'record-invalid'};
    }
  }

  function totalBytes(records){
    return Object.values(records || {}).reduce((sum, record) => sum + (Number(record?.sizeBytes) || 0), 0);
  }

  return {POLICY, sniffMime, parseDataUrl, sha256Hex, validateSourceBytes, validateDimensions, slotFitWarnings, processFile, verifyRecordBytes, verifyRecord, totalBytes};
});
