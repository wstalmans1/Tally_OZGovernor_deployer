wimstalmans@MyMac gov-deployer % pnpm deployc --network sepolia


> gov_deployer@1.0.0 deployc /Users/wimstalmans/Projects/Tally_OZGovernor/gov-deployer
> pnpm deploy:contracts --network sepolia


> gov_deployer@1.0.0 deploy:contracts /Users/wimstalmans/Projects/Tally_OZGovernor/gov-deployer
> hardhat deploy  --reset --network sepolia

Downloading compiler 0.8.20
Generating typings for: 57 artifacts in dir: types for target: ethers-v6
Successfully generated 150 typings!
Compiled 56 Solidity files successfully (evm target: paris).
Deploying Open Zepellin Governance contracts
network:sepolia 
signer:0xD78C12137087D394c0FA49634CAa80D0a1985A8A

Future contract addresses
Token contract addresses: 0x6675637D2DE4A4fAaF36F76f1EE62Fa1d9B4fd38 
Governance contract address: 0xe30e165737e8D041d575511bD92F915E708D2774 
Timelock contract address: 0xDE3C3588C103443538d2870A480E1a868FF87103 

ClockMode will use  block number  as time unit

TOKEN ARGS
token name: WE LOVE TALLY TOKEN 
token symbol: WLTT 
default admin: 0xe30e165737e8D041d575511bD92F915E708D2774 
pauser: 0xe30e165737e8D041d575511bD92F915E708D2774 
minter: 0xD78C12137087D394c0FA49634CAa80D0a1985A8A 

deploying "ERC20Token" (tx: 0xeed6962ba0efd447eaa5ffd4349d4564501d5fd42545913105a377fdebbb31d9)...: deployed at 0x6675637D2DE4A4fAaF36F76f1EE62Fa1d9B4fd38 with 2268417 gas

Token contract:  0x6675637D2DE4A4fAaF36F76f1EE62Fa1d9B4fd38

npx hardhat verify --network sepolia 0x6675637D2DE4A4fAaF36F76f1EE62Fa1d9B4fd38 "WE LOVE TALLY TOKEN" "WLTT" 0xD78C12137087D394c0FA49634CAa80D0a1985A8A 0xD78C12137087D394c0FA49634CAa80D0a1985A8A 0xD78C12137087D394c0FA49634CAa80D0a1985A8A

TIMELOCK ARGS
timelock min delay: 10 
executors: ["0xe30e165737e8D041d575511bD92F915E708D2774","0xDE3C3588C103443538d2870A480E1a868FF87103"] 
proposers: ["0xe30e165737e8D041d575511bD92F915E708D2774","0xDE3C3588C103443538d2870A480E1a868FF87103"] 
admin: 0xDE3C3588C103443538d2870A480E1a868FF87103 

deploying "TimelockController" (tx: 0x69101b8152ef6ede3783040049b2aa37aca12c8c0bbf72ca3b9b29d296f905e2)...: deployed at 0xDE3C3588C103443538d2870A480E1a868FF87103 with 1780632 gas

Timelock contract:  0xDE3C3588C103443538d2870A480E1a868FF87103

npx hardhat verify --network sepolia --contract "contracts/TimelockController.sol:TimelockController"--constructor-args arguments_0xDE3C3588C103443538d2870A480E1a868FF87103.js 0xDE3C3588C103443538d2870A480E1a868FF87103

GOVERNOR ARGS
name: WE LOVE TALLY DAO 
Token contract addresses: 0x6675637D2DE4A4fAaF36F76f1EE62Fa1d9B4fd38 
Timelock contract address: 0xDE3C3588C103443538d2870A480E1a868FF87103 
voting delay: 1 
voting period: 25 
proposal threshold period: 0 
quorum numerator: 4 
vote extension: 25 

deploying "OZGovernor" (tx: 0x9e0625f05681fe6316e3e4818086c640a053742478b1ac58ec50d2c24605b7aa)...: deployed at 0xe30e165737e8D041d575511bD92F915E708D2774 with 4800364 gas

VETOER Governor contract:  0xe30e165737e8D041d575511bD92F915E708D2774

npx hardhat verify --network sepolia 0xe30e165737e8D041d575511bD92F915E708D2774 "WE LOVE TALLY DAO" 0x6675637D2DE4A4fAaF36F76f1EE62Fa1d9B4fd38 0xDE3C3588C103443538d2870A480E1a868FF87103 1 25 0 4 25

Minted 100 tokens to 0xD78C12137087D394c0FA49634CAa80D0a1985A8A
Minter role granted to 0xD78C12137087D394c0FA49634CAa80D0a1985A8A
Default admin role granted to 0xe30e165737e8D041d575511bD92F915E708D2774
Minter role revoked from 0xe30e165737e8D041d575511bD92F915E708D2774
Minter role revoked from 0xe30e165737e8D041d575511bD92F915E708D2774