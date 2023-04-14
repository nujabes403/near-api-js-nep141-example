import { connect, keyStores, utils, transactions, WalletConnection } from "near-api-js"

const KEY_PATH = "./key.json" // fill your key path
const ACCOUNT_ID = "centtest.testnet" // fill your account id
const NETWORK_ID = "testnet"
const NODE_URL = "https://rpc.testnet.near.org"

const TOKEN_CONTRACT = "ref.fakes.testnet"
const TRANSFER_CALL_RECEIVER = "ref-finance-101.testnet";

(async () => {
  // Connect to near account
  const near = await connect({
    keyPath: KEY_PATH,
    keyStore: new keyStores.UnencryptedFileSystemKeyStore(KEY_PATH),
    networkId: NETWORK_ID,
    nodeUrl: NODE_URL,
  })
  const account = await near.account(ACCOUNT_ID)

  // 0. Get NEAR Balance
  const balance = await account.getAccountBalance()
  
  // 1. NEP141 ft_balance_of
  const tokenBalance = await ft_balance_of(account, {
    contract_id: TOKEN_CONTRACT,
    account_id: ACCOUNT_ID,
  })
  // console.log(tokenBalance, 'tokenBalance')

  // 2. NEP141 ft_transfer
  const transferResult = await ft_transfer(account, {
    contract_id: TOKEN_CONTRACT,
    receiver: "apijstest.testnet",
    amount: String(10 ** 18),
  })
  // console.log(transferResult, 'transferResult')

  // 3. NEP141 ft_transfer_call
  const transferCallResult = await ft_transfer_call(account, {
    contract_id: TOKEN_CONTRACT,
    receiver: TRANSFER_CALL_RECEIVER,
    amount: String(10 ** 18),
    msg: ""
  })

  // console.log(transferCallResult, 'transferCallResult')
})()

const ft_balance_of = async (account, { contract_id, account_id }) => {
  const tokenBalance = await account.viewFunction({
    contractId: contract_id,
    methodName: "ft_balance_of",
    args: { account_id },
  })

  return tokenBalance
}

const ft_transfer = async (account, { contract_id, receiver, amount }) => {
  // batch actions
  // 1. storage_deposit
  // 2. ft_transfer
  const actions = [
    transactions.functionCall(
      "storage_deposit",
      { "account_id": receiver },
      30000000000000, // attached gas
      utils.format.parseNearAmount("0.1") // 0.1 near
    ),
    transactions.functionCall(
      "ft_transfer",
      { "receiver_id": receiver, "amount": amount },
      30000000000000, // attached gas
      "1" // 1 yocto near
    ),
  ]


  const result = await account.signAndSendTransaction({
    receiverId: contract_id,
    actions,
  })

  return result
}

const ft_transfer_call = async (account, { contract_id, receiver, amount, msg }) => {

  const actions = [
    transactions.functionCall(
      "storage_deposit",
      { "account_id": receiver },
      90000000000000, // attached gas
      utils.format.parseNearAmount("0.1") // 0.1 near
    ),
    transactions.functionCall(
      "ft_transfer_call",
      { "receiver_id": receiver, "amount": amount, "msg": msg },
      90000000000000, // attached gas
      "1" // 1 yocto near
    ),
  ]

  const result = await account.signAndSendTransaction({
    receiverId: contract_id,
    actions,
  })

  return result
}