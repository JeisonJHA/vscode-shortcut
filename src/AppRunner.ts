"use strict";

import { exec, spawn } from "child_process";
import fs = require("fs");
import { window } from "vscode";
import * as vscode from "vscode";

export interface IApplication {
    name: string;
    path: string;
    folder: boolean;
}

export class AppRunner {

    public static run(appName: string, appPath: string, param?: string) {
        if (!fs.existsSync(appPath)) {
            window.showErrorMessage("Application " + appPath + " not found!");
            return;
        }

        exec('start \"app cmd\" \"' + appPath, (error, stdout, stderr) => {
            if (error) {
                console.log("error: " + error);
            } else {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
            }
        });
    }

    public static runCMD(appPath: string, param?: string): void {
        if (!fs.existsSync(appPath)) {
            window.showErrorMessage("Application " + appPath + " not found!");
            return;
        }

        const channel = vscode.window.createOutputChannel("RunCommand");
        channel.show();

        const rc = spawn(appPath, param.split(" "));
        channel.appendLine("Runing command...");
        rc.stdout.on("data", (data) => {
            channel.appendLine(data.toString());
        });
        rc.stderr.on("data", (data) => {
            channel.appendLine("ERROR: " + data.toString());
        });
        rc.on("exit", (code) => {
            console.log("child process exited with code " + code.toString());
        });
    }
}
