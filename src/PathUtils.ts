import fs = require("fs");
import os = require("os");
import path = require("path");
import * as vscode from "vscode";

export class PathUtils {
  public static getProjectFilePath(filename: string) {
    let projectFile: string;
    const appdata = process.env.APPDATA || (process.platform === "darwin" ?
      process.env.HOME + "/Library/Application Support" : "/var/local");
    const channelPath: string = PathUtils.getChannelPath();
    projectFile = path.join(appdata, channelPath, "User", filename);
    // in linux, it may not work with /var/local, then try to use /home/myuser/.config
    if ((process.platform === "linux") && (!fs.existsSync(projectFile))) {
      projectFile = path.join(os.homedir(), ".config/", channelPath, "User", filename);
    }
    return projectFile;
  }

  public static getChannelPath(): string {
    return vscode.env.appName.replace("Visual Studio ", "");
  }
}
