import { workspace, TextDocument } from 'vscode';

export function isFileActive(file: string): boolean {
  if (workspace.textDocuments) {
    for (let i = 0; i < workspace.textDocuments.length; i++) {
      const doc: TextDocument = workspace.textDocuments[i];
      if (doc.fileName === file) {
        return true;
      }
    }
  }
  return false;
}