import fs = require("fs");
import * as vscode from "vscode";
import { PathUtils } from "./PathUtils";

export class EditorUtils {
  public static openConfigFile(filename: string, command: string, defobj: any) {
    const f = PathUtils.getProjectFilePath(filename);
    if (fs.existsSync(f)) {
      vscode.workspace.openTextDocument(f).then((doc) => {
        vscode.window.showTextDocument(doc);
      });
    } else {
      fs.writeFileSync(f, JSON.stringify(defobj, null, "\t"));
      vscode.commands.executeCommand(command);
    }
  }
}
