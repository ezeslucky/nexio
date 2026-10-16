import { isSourceFile } from './analyzer';

export interface ExtractedFile {
  path: string;
  content: string;
}

/**
 * Extracts source code files from an uploaded ZIP archive or local folder
 */
export async function loadFilesFromZip(file: File): Promise<ExtractedFile[]> {
  try {
    // Dynamic import of JSZip
    const JSZipModule = await import('jszip');
    const JSZip = (JSZipModule.default || JSZipModule) as any;
    const zip = await JSZip.loadAsync(file);

    const extractedFiles: ExtractedFile[] = [];
    const entries = Object.keys(zip.files);

    for (const relativePath of entries) {
      const zipEntry = zip.files[relativePath];
      if (!zipEntry.dir && isSourceFile(relativePath)) {
        try {
          const content = await zipEntry.async('string');
          extractedFiles.push({
            path: relativePath,
            content,
          });
        } catch (readErr) {
          console.warn(`Failed to read file ${relativePath} from zip`, readErr);
        }
      }
    }

    return extractedFiles;
  } catch (err) {
    console.error('JSZip extraction failed or library unavailable', err);
    throw new Error('Could not parse ZIP file. Please ensure it is a valid ZIP archive containing text source files.');
  }
}

/**
 * Reads files selected via <input type="file" webkitdirectory multiple />
 */
export async function loadFilesFromDirectoryInput(fileList: FileList): Promise<ExtractedFile[]> {
  const extractedFiles: ExtractedFile[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const path = file.webkitRelativePath || file.name;

    if (isSourceFile(path)) {
      try {
        const content = await file.text();
        extractedFiles.push({
          path,
          content,
        });
      } catch (e) {
        console.warn(`Failed to read file ${path}`, e);
      }
    }
  }

  return extractedFiles;
}
