import { createConfig, configureChains } from 'wagmi'
import { http } from 'viem'
import { mainnet, bsc, polygon } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'

const { chains, publicClient } = configureChains(
  [mainnet, bsc, polygon],
  [publicProvider()]
)

export const config = createConfig({
  chains,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'MetaMask',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
})

export { chains }
