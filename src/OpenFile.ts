"use strict";

import fs = require("fs");
import path = require("path");
import * as vscode from "vscode";

export class OpenFile {

  public static OpenProjectFile(filename: string): void {
    if (!vscode.workspace.rootPath) {
      vscode.window.showInformationMessage("No project open");
      return;
    }

    const targetFile = path.join(vscode.workspace.rootPath, filename);
    if (!fs.existsSync(targetFile)) {
      vscode.window.showInformationMessage(`File "${filename}" not found`);
      return;
    }

    vscode.workspace.openTextDocument(targetFile).then((doc) => {
      vscode.window.showTextDocument(doc);
    });

  }

}
