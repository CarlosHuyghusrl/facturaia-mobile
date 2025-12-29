"use strict";

import { TurboModuleRegistry } from 'react-native';
export let ResponseType = /*#__PURE__*/function (ResponseType) {
  /**
   * Use this response type if you want document scan returned as base64 images.
   */
  ResponseType["Base64"] = "base64";
  /**
   * Use this response type if you want document scan returned as inmage file paths.
   */
  ResponseType["ImageFilePath"] = "imageFilePath";
  return ResponseType;
}({});
export let ScanDocumentResponseStatus = /*#__PURE__*/function (ScanDocumentResponseStatus) {
  /**
   * The status comes back as success if the document scan completes
   * successfully.
   */
  ScanDocumentResponseStatus["Success"] = "success";
  /**
   * The status comes back as cancel if the user closes out of the camera
   * before completing the document scan.
   */
  ScanDocumentResponseStatus["Cancel"] = "cancel";
  return ScanDocumentResponseStatus;
}({});
export default TurboModuleRegistry.getEnforcing('DocumentScanner');
//# sourceMappingURL=NativeDocumentScanner.js.map