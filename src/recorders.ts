import { TextDocument, TextDocumentChangeEvent, WindowState, window, TextDocumentContentChangeEvent, workspace, TextEditorSelectionChangeEvent, Terminal } from 'vscode';
import { isFileActive } from './utils/common';
import { EventType } from './utils/event';
import { sendEventToServer, putEvent, putEventWithRawData } from './utils/sender';

export class KeystrokeStatsRecorder {

  public async activate() {
    // document listener handlers
    workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this);
    workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this);
    workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this);

    // window state changed handler
    window.onDidChangeWindowState(this.onDidChangeWindowState, this);
    window.onDidChangeActiveTerminal(this.onDidChangeActiveTerminal, this);
    window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection, this);
  }

  public async deactivate() {
    // 可以发送关闭连接事件
    // 卸载前发送一次数据
    await sendEventToServer();
  }

  public async onDidOpenTextDocument(textDocument: TextDocument) {
    if (!window.state.focused) {
      return;
    }

    const { fileName: fsPath } = textDocument;
    if (!this.isValidatedFile(textDocument, fsPath)) {
      return;
    }

    console.log("[recorders] 打开文件");
    // const keyStrokeStats = await this.createKeystrokeStats(fsPath);
    // const currentFileChange = keyStrokeStats.files[fsPath];
    // currentFileChange.updateTextInfo(textDocument);
    // currentFileChange.open += 1;

    putEvent(EventType.MOUSE);
  }

  public async onDidCloseTextDocument(textDocument: TextDocument) {
    if (!window.state.focused) {
      return;
    }

    const { fileName: fsPath } = textDocument;
    if (!this.isValidatedFile(textDocument, fsPath, true)) {
      return;
    }
    console.log("[recorders] 关闭文件");
    // const keyStrokeStats = await this.createKeystrokeStats(fsPath);
    // const currentFileChange = keyStrokeStats.files[fsPath];
    // currentFileChange.close += 1;
    putEvent(EventType.MOUSE);
  }

  public async onDidChangeTextDocument(textDocumentChangeEvent: TextDocumentChangeEvent) {
    if (textDocumentChangeEvent.document.uri.scheme !== 'file') {
      return;
    }
    const windowIsFocused = window.state.focused;
    console.log("[onDidChangeTextDocument][windowIsFocused]" + windowIsFocused);
    if (!windowIsFocused) {
      return;
    }

    const { document } = textDocumentChangeEvent;
    const { fileName: fsPath } = document;

    console.log("[recorders] 编写文件");

    const isValidatedFile = this.isValidatedFile(document, fsPath);
    console.log("[onDidChangeTextDocument][isValidatedFile]" + isValidatedFile);
    if (!isValidatedFile) {
      return;
    }

    const contentChanges = textDocumentChangeEvent.contentChanges.filter((change) => change.range);
    for (const contentChange of contentChanges) {
      const { rangeLength, text, range } = contentChange;
      console.log(contentChange);
      // 发送按键事件

      putEventWithRawData(EventType.KEY_PRESS, { "char": text });
    }
  }

  public async onDidChangeWindowState(windowState: WindowState) {
    const { focused } = windowState;
    console.log("[recorders] 看别的文件");
    putEvent(EventType.MOUSE);
    if (!focused) {
      // 文件失焦
    }
  }

  public async onDidChangeActiveTerminal(terminal: Terminal | undefined) {
    console.log("[recorders] 更改了 terminal");
    putEvent(EventType.MOUSE);
  }

  public async onDidChangeTextEditorSelection(textDocumentChangeEvent: TextEditorSelectionChangeEvent) {
    console.log("[recorders] 更改了编辑器的 selection");
    putEvent(EventType.MOUSE);
  }

  /**
   * This will return true if it's a validated file.
   * we don't want to send events for .git or
   * other event triggers such as extension.js.map events
   */
  private isValidatedFile(textDocument: TextDocument, fsPath: string, isCloseEvent?: boolean) {
    if (!fsPath) {
      return false;
    }

    const { scheme } = textDocument.uri;

    // we'll get 'git' as a scheme, but these are the schemes that match to open files in the editor
    const isDocEventScheme = scheme === 'file' || scheme === 'untitled' || scheme === 'vscode-remote';
    const isLiveShareTmpFile = fsPath.match(/.*\.code-workspace.*vsliveshare.*tmp-.*/);
    // const isInternalFile = fsPath.match(
    // /.*\.appworks.*/,
    // );

    // return false that its not a doc that we want to track based on the
    // following conditions:
    // non-doc scheme, is liveShare tmp file, is internal file and the file is no longer active
    if (
      !isDocEventScheme ||
      isLiveShareTmpFile ||
      // isInternalFile ||
      (!isFileActive(fsPath) && !isCloseEvent)
    ) {
      return false;
    }

    return true;
  }
}

/**
 * 实例化
 */
let keystrokeStatsRecorder: KeystrokeStatsRecorder;
export function getInterface() {
  if (!keystrokeStatsRecorder) {
    keystrokeStatsRecorder = new KeystrokeStatsRecorder();
  }
  return keystrokeStatsRecorder;
}