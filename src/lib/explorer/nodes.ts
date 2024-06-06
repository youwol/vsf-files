import { ImmutableTree } from '@youwol/rx-tree-views'
import { ExplorerBackend } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { map } from 'rxjs/operators'

export type NodeCategory = 'Node' | 'Folder' | 'Item'

export abstract class NodeBase extends ImmutableTree.Node {
    public readonly name: string
    public readonly category: NodeCategory = 'Node'
    public readonly response:
        | ExplorerBackend.FolderBase
        | ExplorerBackend.ItemBase

    protected constructor({
        id,
        name,
        children,
    }: {
        id: string
        name: string
        children?: NodeBase[]
    }) {
        super({ id, children })
        this.name = name
    }
}

export class FolderNode extends NodeBase {
    public readonly category: NodeCategory = 'Folder'
    public readonly response: ExplorerBackend.FolderBase

    constructor(params: {
        id: string
        name: string
        children
        response: ExplorerBackend.FolderBase
    }) {
        super({
            id: params.id,
            name: params.name,
            children: params.children,
        })
        Object.assign(this, params)
    }
}

export class ItemNode extends NodeBase {
    public readonly category: NodeCategory = 'Item'
    public readonly response: ExplorerBackend.ItemBase

    constructor(params: {
        id: string
        name: string
        response: ExplorerBackend.ItemBase
    }) {
        super({
            id: params.id,
            name: params.name,
        })
        Object.assign(this, params)
    }
}

export function createFolderNode(
    response: ExplorerBackend.FolderBase,
    client: ExplorerBackend.Client,
) {
    return new FolderNode({
        id: response.folderId,
        name: response.name,
        response,
        children: client.queryChildren$({ parentId: response.folderId }).pipe(
            raiseHTTPErrors(),
            map(({ items, folders }) => {
                return [
                    ...folders.map((respChild) => {
                        return createFolderNode(respChild, client)
                    }),
                    ...items.map((item) => {
                        return new ItemNode({
                            id: item.itemId,
                            name: item.name,
                            response: item,
                        })
                    }),
                ]
            }),
        ),
    })
}
