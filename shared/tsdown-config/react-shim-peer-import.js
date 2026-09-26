import { transformSync } from '@babel/core'

// Rolldown leaves external require('react') calls in bundled CJS shims.
// Use a static peer import so both ESM and browser UMD share the consumer's React.
export function reactShimPeerImport() {
  return {
    name: 'react-shim-peer-import',
    transform(code, id) {
      if (!/[\\/]use-sync-external-store[\\/].*\.js$/.test(id)) {
        return null
      }

      return transformSync(code, {
        filename: id,
        configFile: false,
        babelrc: false,
        sourceMaps: true,
        plugins: [
          ({ types }) => ({
            visitor: {
              CallExpression(call, state) {
                if (
                  !call.get('callee').isIdentifier({ name: 'require' }) ||
                  call.node.arguments.length !== 1 ||
                  !types.isStringLiteral(call.node.arguments[0], { value: 'react' }) ||
                  call.scope.hasBinding('require')
                ) {
                  return
                }

                if (!state.reactPeer) {
                  state.reactPeer = call.scope.getProgramParent().generateUidIdentifier('reactPeer')
                }
                call.replaceWith(types.cloneNode(state.reactPeer))
              },
              Program: {
                exit(program, state) {
                  if (!state.reactPeer) {
                    return
                  }
                  program.unshiftContainer(
                    'body',
                    types.importDeclaration(
                      [types.importNamespaceSpecifier(state.reactPeer)],
                      types.stringLiteral('react')
                    )
                  )
                },
              },
            },
          }),
        ],
      })
    },
  }
}
