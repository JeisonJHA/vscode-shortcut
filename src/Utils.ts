import * as vscode from "vscode";

export class Utils {
  public static ReturnCmd(item: any) {
    let name: string;
    let cmd: vscode.Command;
    if (item.type === "cmd") {
      name = "shortcutsProvider.runCMD";
    } else {
      name = "shortcutsProvider.run";
    }
    cmd = {
      command: name, title: "", arguments: [
        item.name,
        item.path.replace("${workspaceFolder}", vscode.workspace.rootPath),
        item.param.replace("${workspaceFolder}", vscode.workspace.rootPath)],
    };
    return cmd;
  }
}
