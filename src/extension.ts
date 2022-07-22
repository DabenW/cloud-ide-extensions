// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getInterface as getKeystrokeStats } from './recorders';
import { getInterface as getSocketServer } from './server';
import { activate as activateTimer, deactivate as deactivateTimer } from './utils/timer';
import { sendEventToServer } from './utils/sender';


const keystrokeStatsRecorder = getKeystrokeStats();
const webSocketServer = getSocketServer();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const { subscriptions } = context;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cloud-ide-extensions" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cloud-ide-extensions.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from cloud-ide-extensions!');
	});

	subscriptions.push(disposable);

	activateTimer().catch((e) => {
		console.error('[extesion][activate] 激活 timer error', e);
	});

	keystrokeStatsRecorder.activate().catch((e) => {
		console.error("[extesion][activate] 激活 webSocket error", e);
	});

	webSocketServer.activate().catch((e) => {
		console.error("[extesion][activate] 激活 webSocket error", e);
	});

	/**
	 * Should add event handle after recorders activated
	 * Because recorder will append playload for sender
	 */
	// vscode.window.onDidChangeWindowState((windowState: vscode.WindowState) => {
	// 	if (!windowState.focused) {
	// 		// 离开 vscode 发送一次数据
	// 		sendEventToServer().catch((e) => {
	// 			console.error("[extesion][activate] 离开窗口 发送数据到 server error", e);
	// 		});
	// 	}
	// });
}

// this method is called when your extension is deactivated
export async function deactivate() {
	console.log("关闭插件了");
	try {
		await Promise.all([
			keystrokeStatsRecorder.deactivate(),
			webSocketServer.deactivate()
		]);
	} catch (e) {
		console.error("[extesion][deactive] 卸载键鼠和 Socket error", e);
	}

	try {
		await deactivateTimer();
	} catch (e) {
		console.error("[extesion][deactive] 卸载 timer error", e);
	}
}
