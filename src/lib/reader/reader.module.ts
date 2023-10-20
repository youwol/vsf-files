import { Contracts, Modules } from '@youwol/vsf-core'
import { map, mergeMap } from 'rxjs/operators'
import { AssetsGateway } from '@youwol/http-clients'
import { from } from 'rxjs'
import { raiseHTTPErrors } from '@youwol/http-primitives'

type Mode = 'bytes' | 'text' | 'json'
export const configuration = {
    schema: {
        mode: Modules.stringLiteralAttribute<Mode>({
            value: 'bytes',
        }),
    },
}

export const inputs = {
    input$: {
        description: "An object that allows to retrieve a file's content",
        contract: Contracts.of<{ assetId: string }>({
            description:
                "An object with properties 'assetId' and 'kind', the latter must be 'data'",
            when: (d) => d['assetId'] != undefined && d['kind'] == 'data',
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        mergeMap(({ data, configuration, context }) => {
            const client = new AssetsGateway.Client().files
            return client.get$({ fileId: window.atob(data.assetId) }).pipe(
                raiseHTTPErrors(),
                mergeMap((blob) => {
                    if (configuration.mode === 'bytes') {
                        return from(blob.arrayBuffer())
                    }
                    if (configuration.mode === 'text') {
                        return from(blob.text())
                    }
                    if (configuration.mode === 'json') {
                        return from(blob.text().then((txt) => JSON.parse(txt)))
                    }
                    return from(blob.arrayBuffer())
                }),
                map((text) => ({
                    data: text,
                    context,
                })),
            )
        }),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
        },
        fwdParams,
    )
}
