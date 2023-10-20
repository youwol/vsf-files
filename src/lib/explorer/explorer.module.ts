import { Modules, Configurations } from '@youwol/vsf-core'
import { ExplorerBackend, AssetsGateway } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { ImmutableTree } from '@youwol/fv-tree'
import { filter, map, mergeMap } from 'rxjs/operators'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { createFolderNode, NodeBase } from './nodes'
import { html } from './views'

export const configuration = {
    schema: {
        parentId: Modules.stringAttribute({
            value: '',
        }),
    },
}

export const inputs = {
    input$: {},
}

export const outputs = (
    arg: Modules.OutputMapperArg<
        typeof configuration.schema,
        typeof inputs,
        ModuleState
    >,
) => {
    arg.state.setInputStream(arg.inputs.input$)
    return {
        item$: arg.state.selectedItem$.pipe(
            map((resp) => ({
                data: resp,
                context: {},
            })),
        ),
        folder$: arg.state.selectedFolder$.pipe(
            map((resp) => ({
                data: resp,
                context: {},
            })),
        ),
    }
}

export function module(fwdParams) {
    const state = new ModuleState()
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
            state,
            html: () => html(state),
        },
        fwdParams,
    )
}

export class ExplorerState extends ImmutableTree.State<NodeBase> {
    public readonly moduleState: ModuleState
    constructor(params: {
        moduleState: ModuleState
        rootNode: NodeBase
        expandedNodes: string[]
    }) {
        super(params)
        this.moduleState = params.moduleState
    }
}
export class ModuleState {
    public readonly treeState$: Observable<ExplorerState>
    public readonly rootId$ = new BehaviorSubject<string>(undefined)
    public readonly selectedItem$ = new Subject<ExplorerBackend.ItemBase>()

    public readonly selectedFolder$ = new Subject<ExplorerBackend.FolderBase>()

    public readonly client = new AssetsGateway.Client().explorer

    constructor() {
        this.treeState$ = this.rootId$.pipe(
            filter((rootId) => rootId != undefined),
            mergeMap((rootId) => {
                return this.client.getFolder$({
                    folderId: rootId,
                })
            }),
            raiseHTTPErrors(),
            map((rootFolder) => {
                const rootNode = createFolderNode(
                    rootFolder,
                    new AssetsGateway.Client().explorer,
                )
                return new ExplorerState({
                    rootNode,
                    expandedNodes: [rootFolder.folderId],
                    moduleState: this,
                })
            }),
        )
    }
    setInputStream(
        stream: Observable<
            Modules.ProcessingMessage<
                unknown,
                Configurations.ConfigInstance<typeof configuration.schema>
            >
        >,
    ) {
        stream.subscribe(({ configuration }) => {
            this.rootId$.next(configuration.parentId)
        })
    }
}
