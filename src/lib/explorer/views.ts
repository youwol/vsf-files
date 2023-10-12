import { child$ } from '@youwol/flux-view'
import { ImmutableTree } from '@youwol/fv-tree'
import { NodeBase, NodeCategory } from './nodes'
import { ExplorerBackend } from '@youwol/http-clients'
import { ExplorerState, ModuleState } from './explorer.module'

export function html(state: ModuleState) {
    return {
        class: 'vh-100 fv-bg-background fv-text-primary',
        children: [
            child$(state.treeState$, (state) => {
                return new ImmutableTree.View({
                    state,
                    headerView,
                })
            }),
        ],
    }
}

function headerView(state: ExplorerState, node: NodeBase) {
    const icons: Record<NodeCategory, string> = {
        Node: '',
        Folder: 'fas fa-folder',
        Item: 'fas fa-file',
    }
    return {
        class: 'd-flex align-items-center fv-pointer fv-hover-text-focus',
        children: [
            { class: icons[node.category] },
            { class: 'mx-2' },
            { innerText: node.name },
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
