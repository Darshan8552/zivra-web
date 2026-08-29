import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

export default import.meta.env.DEV
  ? {
      name: 'Tanstack Query',
      render: <ReactQueryDevtoolsPanel />,
    }
  : ({
      name: 'Tanstack Query',
      render: null as unknown as typeof ReactQueryDevtoolsPanel,
    } as never)
