import * as vscode from "vscode";

export class Folder extends vscode.TreeItem {
    public contextValue = "folderNode";

    get tooltip(): string {
        return `${this.label}`;
    }

    constructor(
        public readonly id: string,
        public readonly label: string,
        public AppsList: any[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(label, collapsibleState);
        this.resourceUri = vscode.Uri.parse("\\" + label + "\\");
    }
}
