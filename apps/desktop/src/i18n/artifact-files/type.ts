export interface ArtifactFileActionCopy {
  uploadToCloud: string
  uploadFailed: string
  uploadPrompt: (name: string, path: string, sessionId: string, cloudFolderId?: number) => string
}
