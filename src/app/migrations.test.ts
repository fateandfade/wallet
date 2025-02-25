// TODO(MOB-3867): reduce file length
/* eslint-disable max-lines */
import { BigNumber } from 'ethers'
import mockdate from 'mockdate'
import createMigrate from 'src/app/createMigrate'
import { migrations } from 'src/app/migrations'
import {
  getSchema,
  initialSchema,
  v10Schema,
  v11Schema,
  v12Schema,
  v13Schema,
  v14Schema,
  v15Schema,
  v16Schema,
  v17Schema,
  v18Schema,
  v19Schema,
  v1Schema,
  v20Schema,
  v21Schema,
  v22Schema,
  v23Schema,
  v24Schema,
  v25Schema,
  v26Schema,
  v27Schema,
  v28Schema,
  v29Schema,
  v2Schema,
  v31Schema,
  v32Schema,
  v33Schema,
  v34Schema,
  v35Schema,
  v36Schema,
  v37Schema,
  v38Schema,
  v3Schema,
  v4Schema,
  v5Schema,
  v6Schema,
  v7Schema,
  v8Schema,
  v9Schema,
} from 'src/app/schema'
import { persistConfig } from 'src/app/store'
import { ScannerModalState } from 'src/components/QRCodeScanner/constants'
import { SWAP_ROUTER_ADDRESSES } from 'src/constants/addresses'
import { ChainId } from 'src/constants/chains'
import { initialBiometricsSettingsState } from 'src/features/biometrics/slice'
import { ChainsState, initialChainsState } from 'src/features/chains/chainsSlice'
import { initialCloudBackupState } from 'src/features/CloudBackup/cloudBackupSlice'
import { initialPasswordLockoutState } from 'src/features/CloudBackup/passwordLockoutSlice'
import { ensApi } from 'src/features/ens/api'
import { initialSearchHistoryState } from 'src/features/explore/searchHistorySlice'
import { initialFavoritesState } from 'src/features/favorites/slice'
import { initialModalState } from 'src/features/modals/modalSlice'
import { initialNotificationsState } from 'src/features/notifications/notificationSlice'
import { initialProvidersState } from 'src/features/providers/providerSlice'
import { ModalName } from 'src/features/telemetry/constants'
import { initialTelemetryState } from 'src/features/telemetry/slice'
import { initialTokensState } from 'src/features/tokens/tokensSlice'
import { initialTransactionsState, TransactionState } from 'src/features/transactions/slice'
import {
  TransactionDetails,
  TransactionStatus,
  TransactionType,
} from 'src/features/transactions/types'
import { Account, AccountType, SignerMnemonicAccount } from 'src/features/wallet/accounts/types'
import { DEMO_ACCOUNT_ADDRESS } from 'src/features/wallet/accounts/useTestAccount'
import { initialWalletState } from 'src/features/wallet/walletSlice'
import { initialWalletConnectState } from 'src/features/walletConnect/walletConnectSlice'
import { account, fiatOnRampTxDetailsFailed, txDetailsConfirmed } from 'src/test/fixtures'

// helps with object assignement
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllKeysOfNestedObject = (obj: any, prefix = ''): string[] => {
  const keys = Object.keys(obj)
  if (!keys.length && prefix !== '') return [prefix.slice(0, -1)]
  return keys.reduce<string[]>((res, el) => {
    if (Array.isArray(obj[el])) return [...res]

    if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getAllKeysOfNestedObject(obj[el], prefix + el + '.')]
    }

    return [...res, prefix + el]
  }, [])
}

describe('Redux state migrations', () => {
  it('is able to perform all migrations starting from the initial schema', async () => {
    const initialSchemaStub = {
      ...initialSchema,
      _persist: { version: -1, rehydrated: false },
    }

    const migrate = createMigrate(migrations)
    const migratedSchema = await migrate(initialSchemaStub, persistConfig.version)
    expect(typeof migratedSchema).toBe('object')
  })

  // If this test fails then it's likely a required property was added to the Redux state but a migration was not defined
  it('migrates all the properties correctly', async () => {
    const initialSchemaStub = {
      ...initialSchema,
      _persist: { version: -1, rehydrated: false },
    }

    const migrate = createMigrate(migrations)
    const migratedSchema = await migrate(initialSchemaStub, persistConfig.version)

    // Add new slices here!
    const initialState = {
      appearanceSettings: { selectedAppearanceSettings: 'system' },
      biometricSettings: initialBiometricsSettingsState,
      blocks: { byChainId: {} },
      chains: initialChainsState,
      cloudBackup: initialCloudBackupState,
      ens: { ensForAddress: {} },
      favorites: initialFavoritesState,
      modals: initialModalState,
      notifications: initialNotificationsState,
      passwordLockout: initialPasswordLockoutState,
      providers: initialProvidersState,
      saga: {},
      searchHistory: initialSearchHistoryState,
      telemetry: initialTelemetryState,
      tokenLists: {},
      tokens: initialTokensState,
      transactions: initialTransactionsState,
      wallet: initialWalletState,
      walletConnect: initialWalletConnectState,
      _persist: {
        version: persistConfig.version,
        rehydrated: true,
      },
    }

    const migratedSchemaKeys = new Set(getAllKeysOfNestedObject(migratedSchema))
    const latestSchemaKeys = new Set(getAllKeysOfNestedObject(getSchema()))
    const initialStateKeys = new Set(getAllKeysOfNestedObject(initialState))

    for (const key of initialStateKeys) {
      if (latestSchemaKeys.has(key)) latestSchemaKeys.delete(key)
      if (migratedSchemaKeys.has(key)) migratedSchemaKeys.delete(key)
      initialStateKeys.delete(key)
    }

    expect(migratedSchemaKeys.size).toBe(0)
    expect(latestSchemaKeys.size).toBe(0)
    expect(initialStateKeys.size).toBe(0)
  })

  // This is a precaution to ensure we do not attempt to access undefined properties during migrations
  // If this test fails, make sure all property references to state are using optional chaining
  it('uses optional chaining when accessing old state variables', async () => {
    const emptyStub = { _persist: { version: -1, rehydrated: false } }

    const migrate = createMigrate(migrations)
    const migratedSchema = await migrate(emptyStub, persistConfig.version)
    expect(typeof migratedSchema).toBe('object')
  })

  it('migrates from initialSchema to v0Schema', () => {
    const txDetails0: TransactionDetails = {
      chainId: ChainId.Mainnet,
      id: '0',
      from: '0xShadowySuperCoder',
      options: {
        request: {
          from: '0x123',
          to: '0x456',
          value: '0x0',
          data: '0x789',
          nonce: 10,
          gasPrice: BigNumber.from('10000'),
        },
      },
      typeInfo: {
        type: TransactionType.Approve,
        tokenAddress: '0xtokenAddress',
        spender: SWAP_ROUTER_ADDRESSES[ChainId.Mainnet],
      },
      status: TransactionStatus.Pending,
      addedTime: 1487076708000,
      hash: '0x123',
    }

    const txDetails1: TransactionDetails = {
      chainId: ChainId.Goerli,
      id: '1',
      from: '0xKingHodler',
      options: {
        request: {
          from: '0x123',
          to: '0x456',
          value: '0x0',
          data: '0x789',
          nonce: 10,
          gasPrice: BigNumber.from('10000'),
        },
      },
      typeInfo: {
        type: TransactionType.Approve,
        tokenAddress: '0xtokenAddress',
        spender: SWAP_ROUTER_ADDRESSES[ChainId.Goerli],
      },
      status: TransactionStatus.Success,
      addedTime: 1487076708000,
      hash: '0x123',
    }

    const initialSchemaStub = {
      ...initialSchema,
      transactions: {
        byChainId: {
          [ChainId.Mainnet]: {
            '0': txDetails0,
          },
          [ChainId.Goerli]: {
            '1': txDetails1,
          },
        },
        lastTxHistoryUpdate: {
          '0xShadowySuperCoder': 12345678912345,
          '0xKingHodler': 9876543210987,
        },
      },
    }

    const newSchema = migrations[0](initialSchemaStub)
    expect(newSchema.transactions[ChainId.Mainnet]).toBeUndefined()
    expect(newSchema.transactions.lastTxHistoryUpdate).toBeUndefined()

    expect(newSchema.transactions['0xShadowySuperCoder'][ChainId.Mainnet]['0'].status).toEqual(
      TransactionStatus.Pending
    )
    expect(newSchema.transactions['0xKingHodler'][ChainId.Mainnet]).toBeUndefined()
    expect(newSchema.transactions['0xKingHodler'][ChainId.Goerli]['0']).toBeUndefined()
    expect(newSchema.transactions['0xKingHodler'][ChainId.Goerli]['1'].from).toEqual('0xKingHodler')

    expect(newSchema.notifications.lastTxNotificationUpdate).toBeDefined()
    expect(
      newSchema.notifications.lastTxNotificationUpdate['0xShadowySuperCoder'][ChainId.Mainnet]
    ).toEqual(12345678912345)
  })

  it('migrates from v0 to v1', () => {
    const initialSchemaStub = {
      ...initialSchema,
      walletConnect: {
        ...initialSchema.wallet,
        modalState: ScannerModalState.ScanQr,
      },
    }

    const v0 = migrations[0](initialSchemaStub)
    const v1 = migrations[1](v0)
    expect(v1.walletConnect.modalState).toEqual(undefined)
  })

  it('migrates from v1 to v2', () => {
    const TEST_ADDRESSES = ['0xTest']

    const v1SchemaStub = {
      ...v1Schema,
      favorites: {
        ...v1Schema.favorites,
        followedAddresses: TEST_ADDRESSES,
      },
    }

    const v2 = migrations[2](v1SchemaStub)

    expect(v2.favorites.watchedAddresses).toEqual(TEST_ADDRESSES)
    expect(v2.favorites.followedAddresses).toBeUndefined()
  })

  it('migrates from v2 to v3', () => {
    const v3 = migrations[3](v2Schema)
    expect(v3.searchHistory.results).toEqual([])
  })

  it('migrates from v3 to v4', () => {
    const TEST_ADDRESSES = ['0xTest', '0xTest2', '0xTest3', '0xTest4']
    const TEST_IMPORT_TIME_MS = 12345678912345

    const v3SchemaStub = {
      ...v3Schema,
      wallet: {
        ...v3Schema.wallet,
        accounts: [
          {
            type: AccountType.Readonly,
            address: TEST_ADDRESSES[0],
            name: 'Test Account 1',
            pending: false,
          },
          {
            type: AccountType.Readonly,
            address: TEST_ADDRESSES[1],
            name: 'Test Account 2',
            pending: false,
          },
          {
            type: 'native',
            address: TEST_ADDRESSES[2],
            name: 'Test Account 3',
            pending: false,
          },
          {
            type: 'native',
            address: TEST_ADDRESSES[3],
            name: 'Test Account 4',
            pending: false,
          },
        ],
      },
    }

    mockdate.set(TEST_IMPORT_TIME_MS)

    const v4 = migrations[4](v3SchemaStub)
    expect(v4.wallet.accounts[0].timeImportedMs).toEqual(TEST_IMPORT_TIME_MS)
    expect(v4.wallet.accounts[2].derivationIndex).toBeDefined()
  })

  it('migrates from v4 to v5', () => {
    const v5 = migrations[5](v4Schema)

    expect(v4Schema.balances).toBeDefined()
    expect(v5.balances).toBeUndefined()

    expect(v5.modals[ModalName.Swap].isOpen).toEqual(false)
    expect(v5.modals[ModalName.Send].isOpen).toEqual(false)
  })

  it('migrates from v5 to v6', () => {
    const v6 = migrations[6](v5Schema)

    expect(v6.walletConnect.pendingSession).toBe(null)

    expect(typeof v6.wallet.settings).toBe('object')

    expect(v5Schema.wallet.bluetooth).toBeDefined()
    expect(v6.wallet.bluetooth).toBeUndefined()
  })

  it('migrates from v6 to v7', () => {
    const TEST_ADDRESSES: [string, string, string, string] = [
      '0xTest',
      '0xTest2',
      '0xTest3',
      '0xTest4',
    ]
    const TEST_IMPORT_TIME_MS = 12345678912345

    const v6SchemaStub = {
      ...v6Schema,
      wallet: {
        ...v6Schema.wallet,
        accounts: {
          [TEST_ADDRESSES[0]]: {
            type: 'native',
            address: TEST_ADDRESSES[0],
            name: 'Test Account 1',
            pending: false,
            derivationIndex: 0,
            timeImportedMs: TEST_IMPORT_TIME_MS,
          },
          [TEST_ADDRESSES[1]]: {
            type: 'native',
            address: TEST_ADDRESSES[1],
            name: 'Test Account 2',
            pending: false,
            derivationIndex: 1,
            timeImportedMs: TEST_IMPORT_TIME_MS,
          },
          [TEST_ADDRESSES[2]]: {
            type: 'native',
            address: TEST_ADDRESSES[2],
            name: 'Test Account 3',
            pending: false,
            derivationIndex: 2,
            timeImportedMs: TEST_IMPORT_TIME_MS,
          },
          [TEST_ADDRESSES[3]]: {
            type: 'native',
            address: TEST_ADDRESSES[3],
            name: 'Test Account 4',
            pending: false,
            derivationIndex: 3,
            timeImportedMs: TEST_IMPORT_TIME_MS,
          },
        },
      },
    }

    expect(Object.values(v6SchemaStub.wallet.accounts)).toHaveLength(4)
    const v7 = migrations[7](v6SchemaStub)

    const accounts = Object.values(v7.wallet.accounts) as SignerMnemonicAccount[]
    expect(accounts).toHaveLength(1)
    expect(accounts[0]?.mnemonicId).toEqual(TEST_ADDRESSES[0])
  })

  it('migrates from v7 to v8', () => {
    const v8 = migrations[8](v7Schema)
    expect(v8.cloudBackup.backupsFound).toEqual([])
  })

  it('migrates from v8 to v9', () => {
    const TEST_ADDRESSES: [string, string, string, string] = [
      '0xTest',
      '0xTest2',
      '0xTest3',
      '0xTest4',
    ]
    const TEST_IMPORT_TIME_MS = 12345678912345

    const v8SchemaStub = {
      ...v8Schema,
      wallet: {
        ...v6Schema.wallet,
        accounts: {
          [TEST_ADDRESSES[0]]: {
            type: 'native',
            address: TEST_ADDRESSES[0],
            name: 'Test Account 1',
            pending: false,
            derivationIndex: 0,
            timeImportedMs: TEST_IMPORT_TIME_MS,
          },
          [TEST_ADDRESSES[1]]: {
            type: 'local',
            address: TEST_ADDRESSES[1],
            name: 'Test Account 2',
            pending: false,
            timeImportedMs: TEST_IMPORT_TIME_MS,
          },
        },
      },
    }

    expect(Object.values(v8SchemaStub.wallet.accounts)).toHaveLength(2)
    const v9 = migrations[9](v8SchemaStub)
    expect(Object.values(v9.wallet.accounts)).toHaveLength(1)
  })

  it('migrates from v9 to v10', () => {
    const TEST_ADDRESSES = ['0xTest', DEMO_ACCOUNT_ADDRESS, '0xTest2', '0xTest3']
    const TEST_IMPORT_TIME_MS = 12345678912345

    const accounts = TEST_ADDRESSES.reduce((acc, address) => {
      acc[address] = {
        address,
        timeImportedMs: TEST_IMPORT_TIME_MS,
        type: 'native',
      } as unknown as Account

      return acc
    }, {} as { [address: string]: Account })

    const v9SchemaStub = {
      ...v9Schema,
      wallet: {
        ...v9Schema.wallet,
        accounts,
      },
    }

    expect(Object.values(v9SchemaStub.wallet.accounts)).toHaveLength(4)
    expect(Object.keys(v9SchemaStub.wallet.accounts)).toContain(DEMO_ACCOUNT_ADDRESS)

    const migratedSchema = migrations[10](v9SchemaStub)
    expect(Object.values(migratedSchema.wallet.accounts)).toHaveLength(3)
    expect(Object.keys(migratedSchema.wallet.accounts)).not.toContain(DEMO_ACCOUNT_ADDRESS)
  })

  it('migrates from v10 to v11', () => {
    const v11 = migrations[11](v10Schema)

    expect(v11.biometricSettings).toBeDefined()
    expect(v11.biometricSettings.requiredForAppAccess).toBeDefined()
    expect(v11.biometricSettings.requiredForTransactions).toBeDefined()
  })

  it('migrates from v11 to v12', () => {
    const TEST_ADDRESS = '0xTestAddress'
    const ACCOUNT_NAME = 'Test Account'
    const v11Stub = {
      ...v11Schema,
      wallet: {
        ...v11Schema.wallet,
        accounts: {
          [TEST_ADDRESS]: {
            type: 'native',
            address: TEST_ADDRESS,
            name: ACCOUNT_NAME,
            pending: false,
            derivationIndex: 0,
            timeImportedMs: 123,
          },
        },
      },
    }

    const v12 = migrations[12](v11Stub)

    expect(v12.wallet.accounts[TEST_ADDRESS].pushNotificationsEnabled).toEqual(false)
    expect(v12.wallet.accounts[TEST_ADDRESS].type).toEqual('native')
    expect(v12.wallet.accounts[TEST_ADDRESS].address).toEqual(TEST_ADDRESS)
    expect(v12.wallet.accounts[TEST_ADDRESS].name).toEqual(ACCOUNT_NAME)
  })

  it('migrates from v12 to v13', () => {
    const v13 = migrations[13](v12Schema)
    expect(v13.ens.ensForAddress).toEqual({})
  })

  it('migrates from v13 to v14', () => {
    const v13Stub = {
      ...v13Schema,
      wallet: {
        ...v13Schema.wallet,
        isBiometricAuthEnabled: true,
      },
      biometricSettings: {
        requiredForAppAccess: false,
        requiredForTransactions: false,
      },
    }

    const v14 = migrations[14](v13Stub)
    expect(v14.biometricSettings.requiredForAppAccess).toEqual(true)
    expect(v14.biometricSettings.requiredForTransactions).toEqual(true)
  })

  it('migrates from v14 to v15', () => {
    const TEST_ADDRESS = '0xTestAddress'
    const ACCOUNT_NAME = 'Test Account'
    const v14Stub = {
      ...v14Schema,
      wallet: {
        ...v14Schema.wallet,
        accounts: {
          [TEST_ADDRESS]: {
            type: 'native',
            address: TEST_ADDRESS,
            name: ACCOUNT_NAME,
            pending: false,
            derivationIndex: 0,
            timeImportedMs: 123,
          },
        },
      },
    }

    const v15 = migrations[15](v14Stub)
    const accounts = Object.values(v15.wallet.accounts)
    expect((accounts[0] as Account)?.type).toEqual(AccountType.SignerMnemonic)
  })

  it('migrates from v15 to v16', () => {
    const v15Stub = {
      ...v15Schema,
      dataApi: {},
    }

    const v16 = migrations[16](v15Stub)

    expect(v16.dataApi).toBeUndefined()
  })

  it('migrates from v16 to v17', () => {
    const TEST_ADDRESS = '0xTestAddress'
    const ACCOUNT_NAME = 'Test Account'
    const v16Stub = {
      ...v16Schema,
      wallet: {
        ...v16Schema.wallet,
        accounts: {
          [TEST_ADDRESS]: {
            type: 'native',
            address: TEST_ADDRESS,
            name: ACCOUNT_NAME,
            pending: false,
            derivationIndex: 0,
            timeImportedMs: 123,
            pushNotificationsEnabled: true,
          },
        },
      },
    }

    const v17 = migrations[17](v16Stub)

    expect(v17.wallet.accounts[TEST_ADDRESS].pushNotificationsEnabled).toEqual(false)
    expect(v17.wallet.accounts[TEST_ADDRESS].type).toEqual('native')
    expect(v17.wallet.accounts[TEST_ADDRESS].address).toEqual(TEST_ADDRESS)
    expect(v17.wallet.accounts[TEST_ADDRESS].name).toEqual(ACCOUNT_NAME)
  })

  it('migrates from v17 to v18', () => {
    const v17Stub = {
      ...v17Schema,
      ens: {},
    }
    const v18 = migrations[18](v17Stub)
    expect(v18.ens).toBeUndefined()
  })

  it('migrates from v18 to v19', () => {
    const TEST_ADDRESS = '0xShadowySuperCoder'
    const txDetails0: TransactionDetails = {
      chainId: ChainId.Mainnet,
      id: '0',
      from: TEST_ADDRESS,
      options: {
        request: {
          from: '0x123',
          to: '0x456',
          value: '0x0',
          data: '0x789',
          nonce: 10,
          gasPrice: BigNumber.from('10000'),
        },
      },
      typeInfo: {
        type: TransactionType.Approve,
        tokenAddress: '0xtokenAddress',
        spender: SWAP_ROUTER_ADDRESSES[ChainId.Mainnet],
      },
      status: TransactionStatus.Pending,
      addedTime: 1487076708000,
      hash: '0x123',
    }

    const TEST_ADDRESS_2 = '0xKingHodler'
    const txDetails1: TransactionDetails = {
      chainId: ChainId.Goerli,
      id: '1',
      from: TEST_ADDRESS_2,
      options: {
        request: {
          from: '0x123',
          to: '0x456',
          value: '0x0',
          data: '0x789',
          nonce: 10,
          gasPrice: BigNumber.from('10000'),
        },
      },
      typeInfo: {
        type: TransactionType.Approve,
        tokenAddress: '0xtokenAddress',
        spender: SWAP_ROUTER_ADDRESSES[ChainId.Goerli],
      },
      status: TransactionStatus.Success,
      addedTime: 1487076708000,
      hash: '0x123',
    }

    const ROPSTEN = 3 as ChainId
    const RINKEBY = 4 as ChainId
    const KOVAN = 42 as ChainId

    const transactions: TransactionState = {
      [TEST_ADDRESS]: {
        [ChainId.Mainnet]: {
          '0': txDetails0,
        },
        [ChainId.Goerli]: {
          '0': txDetails0,
          '1': txDetails1,
        },
        [ROPSTEN]: {
          '0': txDetails0,
          '1': txDetails1,
        },
        [RINKEBY]: {
          '0': txDetails1,
        },
        [KOVAN]: {
          '1': txDetails1,
        },
      },
      [TEST_ADDRESS_2]: {
        [ChainId.ArbitrumOne]: {
          '0': txDetails0,
        },
        [ChainId.Optimism]: {
          '0': txDetails0,
          '1': txDetails1,
        },
        [ROPSTEN]: {
          '0': txDetails0,
          '1': txDetails1,
        },
        [RINKEBY]: {
          '0': txDetails1,
        },
        [KOVAN]: {
          '1': txDetails1,
        },
      },
    }

    const blocks = {
      byChainId: {
        [ChainId.Mainnet]: { latestBlockNumber: 123456789 },
        [ChainId.Goerli]: { latestBlockNumber: 123456789 },
        [ROPSTEN]: { latestBlockNumber: 123456789 },
        [RINKEBY]: { latestBlockNumber: 123456789 },
        [KOVAN]: { latestBlockNumber: 123456789 },
        [ChainId.Optimism]: { latestBlockNumber: 123456789 },
      },
    }

    const chains: ChainsState = {
      byChainId: {
        [ChainId.ArbitrumOne]: { isActive: true },
        [ChainId.Goerli]: { isActive: true },
        [ROPSTEN]: { isActive: true },
        [RINKEBY]: { isActive: true },
        [KOVAN]: { isActive: true },
        [ChainId.Optimism]: { isActive: true },
      },
    }

    const v18Stub = {
      ...v18Schema,
      transactions,
      blocks,
      chains,
    }

    const v19 = migrations[19](v18Stub)

    expect(v19.transactions[TEST_ADDRESS][ChainId.Mainnet]).toBeDefined()
    expect(v19.transactions[TEST_ADDRESS][ChainId.Goerli]).toBeDefined()
    expect(v19.transactions[TEST_ADDRESS][ROPSTEN]).toBeUndefined()
    expect(v19.transactions[TEST_ADDRESS][RINKEBY]).toBeUndefined()
    expect(v19.transactions[TEST_ADDRESS][KOVAN]).toBeUndefined()

    expect(v19.transactions[TEST_ADDRESS_2][ChainId.ArbitrumOne]).toBeDefined()
    expect(v19.transactions[TEST_ADDRESS_2][ChainId.Optimism]).toBeDefined()
    expect(v19.transactions[TEST_ADDRESS_2][ROPSTEN]).toBeUndefined()
    expect(v19.transactions[TEST_ADDRESS_2][RINKEBY]).toBeUndefined()
    expect(v19.transactions[TEST_ADDRESS_2][KOVAN]).toBeUndefined()

    expect(v19.blocks.byChainId[ChainId.Mainnet]).toBeDefined()
    expect(v19.blocks.byChainId[ChainId.Goerli]).toBeDefined()
    expect(v19.blocks.byChainId[ChainId.Optimism]).toBeDefined()
    expect(v19.blocks.byChainId[ROPSTEN]).toBeUndefined()
    expect(v19.blocks.byChainId[RINKEBY]).toBeUndefined()
    expect(v19.blocks.byChainId[KOVAN]).toBeUndefined()

    expect(v19.chains.byChainId[ChainId.ArbitrumOne]).toBeDefined()
    expect(v19.chains.byChainId[ChainId.Goerli]).toBeDefined()
    expect(v19.chains.byChainId[ChainId.Optimism]).toBeDefined()
    expect(v19.chains.byChainId[ROPSTEN]).toBeUndefined()
    expect(v19.chains.byChainId[RINKEBY]).toBeUndefined()
    expect(v19.chains.byChainId[KOVAN]).toBeUndefined()
  })

  it('migrates from v19 to v20', () => {
    const v19Stub = {
      ...v19Schema,
      notifications: {
        ...v19Schema.notifications,
        lastTxNotificationUpdate: { [1]: 122342134 },
      },
    }

    const v20 = migrations[20](v19Stub)
    expect(v20.notifications.lastTxNotificationUpdate).toEqual({})
  })

  it('migrates from v20 to v21', () => {
    const v20Stub = {
      ...v20Schema,
    }

    const v21 = migrations[21](v20Stub)
    expect(v21.experiments).toBeDefined()
  })

  it('migrates from v21 to v22', () => {
    const v21Stub = {
      ...v21Schema,
      coingeckoApi: {},
    }
    const v22 = migrations[22](v21Stub)
    expect(v22.coingeckoApi).toBeUndefined()
    expect(v22.tokens.watchedTokens).toBeUndefined()
    expect(v22.tokens.tokenPairs).toBeUndefined()
  })

  it('migrates from v22 to v23', () => {
    const v22Stub = {
      ...v22Schema,
    }
    const v23 = migrations[23](v22Stub)
    expect(v23.wallet.settings.tokensOrderBy).toBeUndefined()
    expect(v23.wallet.settings.tokensMetadataDisplayType).toBeUndefined()
  })

  it('migrates from v23 to v24', () => {
    const dummyAddress1 = '0xDumDum1'
    const dummyAddress2 = '0xDumDum2'
    const dummyAddress3 = '0xDumDum3'
    const v23Stub = {
      ...v23Schema,
      notifications: {
        ...v23Schema.notifications,
        notificationCount: { [dummyAddress1]: 5, [dummyAddress2]: 0, [dummyAddress3]: undefined },
      },
    }
    const v24 = migrations[24](v23Stub)
    expect(v24.notifications.notificationCount).toBeUndefined()
    expect(v24.notifications.notificationStatus[dummyAddress1]).toBe(true)
    expect(v24.notifications.notificationStatus[dummyAddress2]).toBe(false)
    expect(v24.notifications.notificationStatus[dummyAddress2]).toBe(false)
  })

  it('migrates from v24 to v25', () => {
    const v24Stub = {
      ...v24Schema,
    }
    const v25 = migrations[25](v24Stub)
    expect(v25.passwordLockout.passwordAttempts).toBe(0)
  })

  it('migrates from v25 to v26', () => {
    const v25Stub = {
      ...v25Schema,
    }
    const v26 = migrations[26](v25Stub)
    expect(v26.wallet.settings.showSmallBalances).toBeUndefined()
  })

  it('migrates from v26 to v27', () => {
    const v26Stub = {
      ...v26Schema,
    }
    const v27 = migrations[27](v26Stub)
    expect(v27.wallet.settings.tokensOrderBy).toBeUndefined()
  })

  it('migrates from v27 to v28', () => {
    const v27Stub = {
      ...v27Schema,
    }
    const v28 = migrations[28](v27Stub)
    expect(v28.wallet.settings.tokensMetadataDisplayType).toBeUndefined()
  })

  it('migrates from v28 to v29', () => {
    const v28Stub = {
      ...v28Schema,
    }
    const v29 = migrations[29](v28Stub)
    expect(v29.tokenLists).toBeUndefined()
    expect(v29.tokens.customTokens).toBeUndefined()
  })

  it('migrates from v29 to v30', () => {
    const oldFiatOnRampTxDetails = {
      chainId: ChainId.Mainnet,
      id: '0',
      from: account.address,
      options: {
        request: {},
      },
      // expect this payload to change
      typeInfo: {
        type: TransactionType.FiatPurchase,
        explorerUrl: 'explorer',
        outputTokenAddress: '0xtokenAddress',
        outputCurrencyAmountFormatted: 50,
        outputCurrencyAmountPrice: 2,
        syncedWithBackend: true,
      },
      status: TransactionStatus.Pending,
      addedTime: 1487076708000,
      hash: '0x123',
    }
    const expectedTypeInfo = {
      type: TransactionType.FiatPurchase,
      explorerUrl: 'explorer',
      inputCurrency: undefined,
      inputCurrencyAmount: 25,
      outputCurrency: {
        type: 'crypto',
        metadata: {
          chainId: undefined,
          contractAddress: '0xtokenAddress',
        },
      },
      outputCurrencyAmount: undefined,
      syncedWithBackend: true,
    }
    const transactions = {
      [account.address]: {
        [ChainId.Mainnet]: {
          '0': oldFiatOnRampTxDetails,
          '1': txDetailsConfirmed,
        },
        [ChainId.Goerli]: {
          '0': { ...oldFiatOnRampTxDetails, status: TransactionStatus.Failed },
          '1': txDetailsConfirmed,
        },
        [ChainId.ArbitrumOne]: {
          '0': { ...oldFiatOnRampTxDetails, status: TransactionStatus.Failed },
        },
      },
      ['0xshadowySuperCoder']: {
        [ChainId.ArbitrumOne]: {
          '0': oldFiatOnRampTxDetails,
          '1': txDetailsConfirmed,
        },
        [ChainId.Optimism]: {
          '0': oldFiatOnRampTxDetails,
          '1': oldFiatOnRampTxDetails,
          '2': txDetailsConfirmed,
        },
      },
      ['0xdeleteMe']: {
        [ChainId.Mainnet]: {
          '0': { ...oldFiatOnRampTxDetails, status: TransactionStatus.Failed },
        },
      },
    }
    const v29Stub = { ...v29Schema, transactions }

    const v30 = migrations[30](v29Stub)

    // expect fiat onramp txdetails to change
    expect(v30.transactions[account.address][ChainId.Mainnet]['0'].typeInfo).toEqual(
      expectedTypeInfo
    )
    expect(v30.transactions[account.address][ChainId.Goerli]['0']).toBeUndefined()
    expect(v30.transactions[account.address][ChainId.ArbitrumOne]).toBeUndefined() // does not create an object for chain
    expect(v30.transactions['0xshadowySuperCoder'][ChainId.ArbitrumOne]['0'].typeInfo).toEqual(
      expectedTypeInfo
    )
    expect(v30.transactions['0xshadowySuperCoder'][ChainId.Optimism]['0'].typeInfo).toEqual(
      expectedTypeInfo
    )
    expect(v30.transactions['0xshadowySuperCoder'][ChainId.Optimism]['1'].typeInfo).toEqual(
      expectedTypeInfo
    )
    expect(v30.transactions['0xdeleteMe']).toBe(undefined)
    // expect non-for txDetails to not change
    expect(v30.transactions[account.address][ChainId.Mainnet]['1']).toEqual(txDetailsConfirmed)
    expect(v30.transactions[account.address][ChainId.Goerli]['1']).toEqual(txDetailsConfirmed)
    expect(v30.transactions['0xshadowySuperCoder'][ChainId.ArbitrumOne]['1']).toEqual(
      txDetailsConfirmed
    )
    expect(v30.transactions['0xshadowySuperCoder'][ChainId.Optimism]['2']).toEqual(
      txDetailsConfirmed
    )
  })

  it('migrates from v31 to 32', () => {
    const v31Stub = { ...v31Schema, [ensApi.reducerPath]: 'defined' }

    const v32 = migrations[32](v31Stub)

    expect(v32[ensApi.reducerPath]).toBe(undefined)
  })

  it('migrates from v32 to 33', () => {
    const v32Stub = { ...v32Schema }

    const v33 = migrations[33](v32Stub)

    expect(v33.wallet.replaceAccountOptions.isReplacingAccount).toBe(false)
    expect(v33.wallet.replaceAccountOptions.skipToSeedPhrase).toBe(false)
  })

  it('migrates from v33 to 34', () => {
    const v33Stub = { ...v33Schema }

    const v34 = migrations[34](v33Stub)

    expect(v34.telemetry.lastBalancesReport).toBe(0)
  })

  it('migrates from v34 to 35', () => {
    const v34Stub = { ...v34Schema }

    const v35 = migrations[35](v34Stub)

    expect(v35.appearanceSettings.selectedAppearanceSettings).toBe('system')
  })

  it('migrates from v35 to 36', () => {
    const v35Stub = { ...v35Schema }

    const v36 = migrations[36](v35Stub)

    expect(v36.favorites.hiddenNfts).toEqual({})
  })

  it('migrates from v36 to 37', () => {
    const id1 = '123'
    const id2 = '456'
    const id3 = '789'
    const transactions = {
      [account.address]: {
        [ChainId.Mainnet]: {
          [id1]: {
            ...fiatOnRampTxDetailsFailed,
            typeInfo: {
              ...fiatOnRampTxDetailsFailed.typeInfo,
              id: undefined,
            },
          },
          [id2]: {
            ...fiatOnRampTxDetailsFailed,
            typeInfo: {
              ...fiatOnRampTxDetailsFailed.typeInfo,
              id: undefined,
              explorerUrl: undefined,
            },
          },
          [id3]: txDetailsConfirmed,
        },
      },
    }

    const v36Stub = { ...v36Schema, transactions }

    expect(
      v36Stub.transactions[account.address]?.[ChainId.Mainnet][id1].typeInfo.id
    ).toBeUndefined()
    expect(
      v36Stub.transactions[account.address]?.[ChainId.Mainnet][id2].typeInfo.id
    ).toBeUndefined()

    const v37 = migrations[37](v36Stub)

    expect(v37.transactions[account.address]?.[ChainId.Mainnet][id1].typeInfo.id).toEqual(
      fiatOnRampTxDetailsFailed.typeInfo.id
    )
    expect(
      v36Stub.transactions[account.address]?.[ChainId.Mainnet][id2].typeInfo.id
    ).toBeUndefined()
    expect(v36Stub.transactions[account.address]?.[ChainId.Mainnet][id3]).toEqual(
      txDetailsConfirmed
    )
  })

  it('migrates from v37 to 38', () => {
    const v37Stub = { ...v37Schema }
    const v38 = migrations[38](v37Stub)
    expect(v38.wallet.replaceAccountOptions).toBeUndefined()
  })

  it('migrates from v38 to 39', () => {
    const v38Stub = { ...v38Schema }
    expect(v38Stub.experiments).toBeDefined()
    const v39 = migrations[39](v38Stub)
    expect(v39.experiments).toBeUndefined()
  })
})
