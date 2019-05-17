"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import fs = require("fs");
import { AppRunner } from "./AppRunner";
import { PathUtils } from "./PathUtils";
import { CFG_FILE, ShortcutProvider } from "./shortcutProvider";
import { ShortcutStorage } from "./shortCuts";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    const shortcutStorage: ShortcutStorage = new ShortcutStorage(PathUtils.getProjectFilePath(CFG_FILE));
    shortcutStorage.load();
    const shortcutProvider = new ShortcutProvider(shortcutStorage);
    Apps();

    function Apps() {
        const addShortcut = (node, desc, type?) => {
            const nodeName = node ? node.id : "";
            vscode.window.showInputBox({
                prompt: desc + " name",
                placeHolder: "Insert a new " + desc + " name.",
            })
                .then((newName) => {
                    if ((type === "folder") && newName) {
                        shortcutStorage.push(nodeName, newName, type);
                        shortcutProvider.refresh();
                    } else if (newName) { addType(nodeName, newName); }
                });
        };

        const addType = (nodeName: string, newName: string) => {
            vscode.window.showInputBox({
                prompt: "exe/cmd",
                placeHolder: "Insert the new Shortcut type.",
            })
                .then((newType) => {
                    if (newType) {
                        addPath(nodeName, newName, newType);
                    }
                });
        };

        const addPath = (nodeName: string, newName, newType) => {
            vscode.window.showInputBox({
                prompt: "Path",
                placeHolder: "Insert the new Shortcut path.",
            })
                .then((newPath) => {
                    if (newPath) { addParam(nodeName, newName, newType, newPath); }
                });
        };

        const addParam = (nodeName: string, newName, newType, newPath) => {
            vscode.window.showInputBox({
                prompt: "Params",
                placeHolder: "Insert the new Shortcut params.",
            })
                .then((newParam) => {
                    shortcutStorage.push(nodeName, newName, newType, newPath, newParam);
                    shortcutProvider.refresh();
                });
        };

        vscode.window.registerTreeDataProvider("shortcutsProvider", shortcutProvider);

        const refresh = vscode.commands.registerCommand("shortcutsProvider.refreshEntry",
            () => shortcutProvider.refresh());

        const edit = vscode.commands.registerCommand("shortcutsProvider.editShortcut",
            () => shortcutProvider.editShortcut());

        const addFolder = vscode.commands.registerCommand("shortcutsProvider.addFolder",
            (node) => { addShortcut(node, "Folder", "folder"); });

        const addApp = vscode.commands.registerCommand("shortcutsProvider.addShortcut",
            (node) => { addShortcut(node, "Shortcut"); });

        const run = vscode.commands.registerCommand("shortcutsProvider.run",
            (name: string, path: string, param?: string) => {
                AppRunner.run(name, path, param);
            });

        const remove = vscode.commands.registerCommand("shortcutsProvider.remove",
            (node) => {
                shortcutStorage.pop(node.id);
            });

        const runCMD = vscode.commands.registerCommand("shortcutsProvider.runCMD",
            (path: string, param?: string) => {
                AppRunner.runCMD(path, param);
            });

        const viewPath = vscode.commands.registerCommand("shortcutsProvider.view",
            (node) => {
                AppRunner.run("", node.apppath.split("\\").slice(0, -1).join("\\")
                    .replace("${workspaceFolder}", vscode.workspace.rootPath));
            });

        context.subscriptions.push(refresh);
        context.subscriptions.push(edit);
        context.subscriptions.push(addFolder);
        context.subscriptions.push(addApp);
        context.subscriptions.push(run);
        context.subscriptions.push(runCMD);
        context.subscriptions.push(remove);
        context.subscriptions.push(viewPath);
    }

    function listShurtcuts(forceNewWindow: boolean) {
        let items = [];
        items = shortcutStorage.mapForQuick();

        function onRejectlistShurtcuts(reason) {
            vscode.window.showInformationMessage(`Error loading projects: ${reason}`);
        }

        // promisses
        function onResolve(selected) {
            if (!selected) {
                return;
            }

            if (!fs.existsSync(selected.cmd.arguments[1].toString())) {
                vscode.window.showErrorMessage("Shurtcut does not exist or is unavailable.");
            } else {
                vscode.commands.executeCommand(selected.cmd.command, ...selected.cmd.arguments);
            }
        }

        const options = {
            matchOnDetail: false,
            placeHolder: "Loading Apps (pick one to open)"
        } as vscode.QuickPickOptions;

        getShurtcuts(items)
            .then((folders) => {
                vscode.window.showQuickPick(folders as any[], options)
                    .then(onResolve, onRejectlistShurtcuts);
            });
    }

    function getShurtcuts(itemsSorted: any[]): Promise<{}> {
        return new Promise((resolve, reject) => {
            resolve(itemsSorted);
        });
    }

    context.subscriptions.push(vscode.commands.registerCommand("shortcutsProvider.listShurtcuts", () => {
        listShurtcuts(false);
    }));
}
