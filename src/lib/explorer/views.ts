import { AnyVirtualDOM } from '@youwol/rx-vdom'
import { ImmutableTree } from '@youwol/rx-tree-views'
import { NodeBase, NodeCategory } from './nodes'
import { ExplorerBackend } from '@youwol/http-clients'
import { ExplorerState, ModuleState } from './explorer.module'

export function html(state: ModuleState): AnyVirtualDOM {
    return {
        tag: 'div',
        children: [
            {
                source$: state.treeState$,
                vdomMap: (state: ImmutableTree.State<NodeBase>) => {
                    return new ImmutableTree.View({
                        state,
                        headerView,
                    })
                },
            },
        ],
    }
}

function headerView(state: ExplorerState, node: NodeBase): AnyVirtualDOM {
    const icons: Record<NodeCategory, string> = {
        Node: '',
        Folder: 'fas fa-folder',
        Item: 'fas fa-file',
    }
    return {
        tag: 'div',
        class: 'd-flex align-items-center fv-pointer fv-hover-text-focus',
        children: [
            { tag: 'div', class: icons[node.category] },
            { tag: 'div', class: 'mx-2' },
            { tag: 'div', innerText: node.name },
        ],
        onclick: () => {
            node.category == 'Item'
                ? state.moduleState.selectedItem$.next(
                      node.response as ExplorerBackend.ItemBase,
                  )
                : state.moduleState.selectedFolder$.next(
                      node.response as ExplorerBackend.FolderBase,
                  )
        },
    }
}
