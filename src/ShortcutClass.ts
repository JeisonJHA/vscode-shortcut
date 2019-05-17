import * as vscode from "vscode";

export class ShortcutClass extends vscode.TreeItem {
    public contextValue = "shortcutNode";

    get tooltip(): string {
        return `${this.apppath.replace("${workspaceFolder}", vscode.workspace.rootPath)}`;
    }

    constructor(
        public readonly id: string,
        public readonly label: string,
        private apppath: string,
        public readonly type: string,
        public readonly param: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public AppsList?: ShortcutClass[],
    ) {
        super(label, collapsibleState);
        this.resourceUri = vscode.Uri.file(apppath);
    }
}
