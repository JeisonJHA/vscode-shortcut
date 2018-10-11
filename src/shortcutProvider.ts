import fs = require("fs");
import * as vscode from "vscode";

import { EditorUtils } from "./EditorUtils";
import { Folder } from "./Folder";
import { PathUtils } from "./PathUtils";
import { ShortcutClass } from "./ShortcutClass";
import { ShortcutStorage } from "./shortCuts";

export const CFG_FILE = "shortcuts.json";

export class ShortcutProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

  private projectSource: ShortcutStorage;
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> =
    new vscode.EventEmitter<vscode.TreeItem | undefined>();
  public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> =
    this._onDidChangeTreeData.event;

  constructor(projectSource: ShortcutStorage) {
    this.projectSource = projectSource;
  }

  public refresh(): void {
    const shortcutStorage: ShortcutStorage = new ShortcutStorage(PathUtils.getProjectFilePath(CFG_FILE));
    shortcutStorage.load();
    this.projectSource = shortcutStorage;
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  public editShortcut() {
    EditorUtils.openConfigFile(CFG_FILE, "shortcutsProvider.editShortcut", [{ appname: "path" }]);
  }

  public getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    const filename = PathUtils.getProjectFilePath(CFG_FILE);
    if (!fs.existsSync(filename)) {
      return;
    }
    return new Promise((resolve) => {
      let itemList: any[];
      const mapTree = () => {
        resolve(itemList.map((i) => {
          if (i.type === "folder") {
            return new Folder(i.id, i.name, i.files, vscode.TreeItemCollapsibleState.Collapsed);
          } else {
            let name: string;
            let cmd: vscode.Command;
            if (i.type === "cmd") {
              name = "shortcutsProvider.runCMD";
            } else {
              name = "shortcutsProvider.run";
            }
            cmd = {
              command: name, title: "", arguments: [
                i.name,
                i.path.replace("${workspaceFolder}", vscode.workspace.rootPath),
                i.param.replace("${workspaceFolder}", vscode.workspace.rootPath)],
            };
            return new ShortcutClass(i.id, i.name, i.path, i.type, i.param, vscode.TreeItemCollapsibleState.None, cmd);
          }
        }));
      };
      if (element) {
        itemList = this.projectSource.mapArray((element as ShortcutClass).AppsList);
      } else {
        itemList = this.projectSource.map();
      }
      mapTree();
    });
  }
}
