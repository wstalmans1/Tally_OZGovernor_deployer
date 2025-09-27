export const config:any = {
  // Configuration for the deployment
  // Change the values for a more personalized deployment
  token: {
    name: "WE LOVE TALLY TOKEN",
    symbol: "WLTT",
  },
  // Timelock
  timelock: {
    minDelay: 10, // 12 days (assuming 12 seconds per block)
  },
  // Set clockMode to true for timestamp mode, false for block number mode
  clockMode: false,
  // Governor
  governor: {
    name: "WE LOVE TALLY DAO",
    // 7200 is 24 hours (assuming 12 seconds per block)
    votingDelay: 10,
    // 50400 is 7 days (assuming 12 seconds per block)
    votingPeriod: 50,
    // Quorum numerator to denominator of 100
    quorumNumerator: 4,
    // Threshold to be able to propose
    proposalThreshold: 0, // Set a non-zero value to prevent proposal spam.
    // Vote extension: if a late quorum is reached, how long should it be extended?
    voteExtension: 25, // 7200 is 24 hours (assuming 12 seconds per block)
  },
  // First Mint is used to mint the initial tokens for this governance
  // It must be higher than the proposalThreshold
  // so there are enough tokens for the governance to be able to propose
  // 
  // ATTENTION:
  // If the amount is not higher than 0, it will not mint any tokens and will also maintain roles for the deployer.
  // Keep it as ZERO if you plan on doing manual changes and mints, before locking it up to be controlled by governor contracts.
  // 
  // After the first mint, the deployer will lose the minter and admin role and give it to the timelock, which is the executor.
  firstMint: {
    amount: 200, // If set higher than zero, it will mint the specified amount of tokens to the address below
    // 'to' is an Ethereum Address. If empty, it will default to the deployer. If incorrect, it will also default to the deployer (a warning will be issued when deploying).
    to: "0xD78C12137087D394c0FA49634CAa80D0a1985A8A",
  }
}
