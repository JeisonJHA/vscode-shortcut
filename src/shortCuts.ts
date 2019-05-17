import fs = require("fs");
import uuid = require("node-uuid");
import * as vscode from "vscode";
import { Utils } from "./Utils";

interface Item {
  id: string;
  name: string;
  type: string;
}

class Item implements Item {

  public name: string;
  public type: string;

  constructor() {
    this.name = "";
    this.type = "";
  }
}

interface IApp extends Item {
  path: string;
  param: string;
}

// tslint:disable-next-line:max-classes-per-file
class AppItem implements IApp {
  public id: string;
  public name: string;
  public type: string;
  public path: string;
  public param: string;

  constructor(name: string, type: string, path: string, param: string) {
    this.id = uuid.v4();
    this.name = name;
    this.type = type;
    this.path = path;
    this.param = param;
  }
}

interface IAppList extends Array<IApp> { }

interface IFolder extends Item {
  files: IAppList;
}

// tslint:disable-next-line:max-classes-per-file
class FolderItem implements IFolder {
  public id: string;
  public name: string;
  public type: string;
  public files: IAppList;

  constructor(name: string, type: string) {
    this.id = uuid.v4();
    this.name = name;
    this.type = type;
    this.files = [] as IAppList;
  }
}

// interface FolderList extends Array<Folder> { };
interface ItemList extends Array<Item> { }

// tslint:disable-next-line:max-classes-per-file
export class ShortcutStorage {

  private itemList: ItemList;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.itemList = [] as any;
  }

  public push(id: string, name: string, type: string, path?: string, param?: string): void {
    const add = (arr) => {
      switch (type) {
        case "folder":
          arr.push(new FolderItem(name, type));
          break;
        default:
          arr.push(new AppItem(name, type, path, param));
          break;
      }
    };
    const goFolder = (i) => {
      if (i.id === id) {
        add((i as IFolder).files);
      } else if (i.type === "folder") {
        (i as IFolder).files.forEach((f) => goFolder(f));
      }
    };
    if (id === "") { add(this.itemList); } else {
      this.itemList.forEach((i) => goFolder(i));
    }
    this.save();
    return;
  }

  private find(id): Item {
    const goFolder = (i): any => {
      if (i.id === id) {
        return true;
      } else if (i.type === "folder") {
        (i as IFolder).files.forEach((f) => {
          // if (goFolder(f)) { (i as IFolder).files.filter() };
        });
      }
    };
    return goFolder(id);
  }
  private removeFromTree(itemList, id) {
    itemList = itemList.filter((item) => item.id !== id);
    itemList.forEach((item) => item.type === "folder" ?
      item.files = this.removeFromTree(item.files, id) : item);
    return itemList;
  }
  public pop(id: string) {
    this.itemList = this.removeFromTree(this.itemList, id);
    this.save();
    vscode.commands.executeCommand("shortcutsProvider.refreshEntry");
  }

  public rename(oldName: string, newName: string): void {
    for (const element of this.itemList) {
      if (element.name.toLowerCase() === oldName.toLowerCase()) {
        element.name = newName;
        return;
      }
    }
  }

  public load(): string {
    let items = [];

    if (!fs.existsSync(this.filename)) {
      this.itemList = items as ItemList;
      return "";
    }

    try {
      items = JSON.parse(fs.readFileSync(this.filename).toString());
      this.itemList = items as ItemList;
      return "";
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      return error.toString();
    }
  }

  public reload() {
    let items = [];

    if (!fs.existsSync(this.filename)) {
      this.itemList = items as ItemList;
    } else {
      items = JSON.parse(fs.readFileSync(this.filename).toString());
      this.itemList = items as ItemList;
    }
  }

  public save() {
    fs.writeFileSync(this.filename, JSON.stringify(this.itemList, null, "\t"));
  }

  public map(): any[] {
    return this.mapArray(this.itemList);
  }

  public mapForQuick(): any[] {
    const newItems = this.convertTreeToList(this.itemList);
    return newItems
      .map((item) => {
        return {
          label: item.name,
          description: (item as AppItem).path,
          cmd: Utils.ReturnCmd((item as AppItem))
        };
      });
  }

  private convertTreeToList(root: ItemList) {
    const stack = [...root];
    const array = [];
    const hashMap = {};

    while (stack.length !== 0) {
      const node = stack.pop() as Item;
      if (node.type !== "folder") {
        this.visitNode(node, hashMap, array);
      } else {
        for (let i = (node as FolderItem).files.length - 1; i >= 0; i--) {
          stack.push((node as FolderItem).files[i]);
        }
      }
    }

    return array;
  }

  private visitNode(node: any, hashMap: any, array: any[]) {
    array.push(node);
  }

  public mapArray(array: any[]): any[] {
    return array.map((item) => {
      if (item.type === "folder") {
        return {
          id: item.id,
          name: item.name,
          type: item.type,
          files: (item as FolderItem).files,
        };
      } else {
        return {
          id: item.id,
          name: item.name,
          type: item.type,
          path: (item as AppItem).path,
          param: (item as AppItem).param,
        };
      }
    });
  }
}
