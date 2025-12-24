export const mockData = {
  summary: {
    totalTreasuryUSD: 1600000,
    treasuryComposition: {
      stables: 45,
      volatile: 35,
      validator: 15,
      lp: 5
    },
    lastUpdated: new Date().toISOString()
  },

  treasuries: {
    liquidBacking: {
      address: "0xc98431a5c8c499130cEc8aB8671dB9e39435bBFC",
      name: "Liquid Backing Treasury",
      usdValue: 950000,
      assets: [
        { symbol: "USDC", amount: 450000, usdValue: 450000, percentage: 47.4 },
        { symbol: "BERA", amount: 350000, usdValue: 350000, percentage: 36.8 },
        { symbol: "HONEY", amount: 150000, usdValue: 150000, percentage: 15.8 }
      ],
      lastUpdated: new Date().toISOString()
    },
    growth: {
      address: "0xAe8b5e58E423750a68BbB37ccaaD399deF93D24D",
      name: "Growth Treasury Wallet",
      usdValue: 350000,
      assets: [
        { symbol: "BERA", amount: 200000, usdValue: 200000, percentage: 57.1 },
        { symbol: "xFATBERA", amount: 100000, usdValue: 120000, percentage: 34.3 },
        { symbol: "USDC", amount: 30000, usdValue: 30000, percentage: 8.6 }
      ],
      lastUpdated: new Date().toISOString()
    }
  },

  validator: {
    address: "0x2677A37cf5E882C6e368B747A28a458C5d962ea0",
    name: "apDAO Validator",
    stakedAmount: 100000,
    validatorStatus: "active",
    currentAPY: 8.5,
    currentEpochCommission: 1250,
    totalRewardsEarned: 52000,
    rewardHistory: [
      { epoch: 2855, amount: 1250, date: "2025-12-24", timestamp: Date.now() },
      { epoch: 2854, amount: 1180, date: "2025-12-23", timestamp: Date.now() - 86400000 },
      { epoch: 2853, amount: 1320, date: "2025-12-22", timestamp: Date.now() - 172800000 },
      { epoch: 2852, amount: 1100, date: "2025-12-21", timestamp: Date.now() - 259200000 },
      { epoch: 2851, amount: 1410, date: "2025-12-20", timestamp: Date.now() - 345600000 },
      { epoch: 2850, amount: 1290, date: "2025-12-19", timestamp: Date.now() - 432000000 },
      { epoch: 2849, amount: 1150, date: "2025-12-18", timestamp: Date.now() - 518400000 }
    ],
    lastUpdated: new Date().toISOString()
  },

  rewardVault: {
    address: "0xc6DD0727f00cDA3972be452F2009Ec4973Cd74d0",
    name: "Reward Vault",
    totalBGTReceived: 801273,
    totalBGTValue: 477109,
    totalXFATBERAReceived: 750856,
    totalIncentivesValue: 451125,
    balance: 125000,
    dailyEmissions: 12500,
    unclaimedRewards: 45000,
    weeklyDetails: [
      { date: "2025-12-22", xFATBERA_used: 9.1, BGT_received: 5.4, xFATBERA_value: 5.4, BGT_value: 0, profit: 85.4 },
      { date: "2025-12-15", xFATBERA_used: 32.0, BGT_received: 26.8, xFATBERA_value: 16.0, BGT_value: -83.3, profit: 0 },
      { date: "2025-12-08", xFATBERA_used: 16.8, BGT_received: 23.7, xFATBERA_value: 14.1, BGT_value: 84.5, profit: 0 },
      { date: "2025-12-01", xFATBERA_used: 16.8, BGT_received: 3.5, xFATBERA_value: 2.1, BGT_value: -87.6, profit: 0 },
      { date: "2025-11-24", xFATBERA_used: 0, BGT_received: 14.8, xFATBERA_value: 8.8, BGT_value: 88.8, profit: 0 },
      { date: "2025-11-17", xFATBERA_used: 48.8, BGT_received: 35.0, xFATBERA_value: 21.0, BGT_value: -87.8, profit: 0 }
    ],
    lastUpdated: new Date().toISOString()
  },

  treasuryHistory: [
    { date: "2025-11-24", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-11-25", stables: 44, volatile: 36, validator: 15, lp: 5 },
    { date: "2025-11-26", stables: 46, volatile: 34, validator: 15, lp: 5 },
    { date: "2025-11-27", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-11-28", stables: 43, volatile: 37, validator: 15, lp: 5 },
    { date: "2025-11-29", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-11-30", stables: 47, volatile: 33, validator: 15, lp: 5 },
    { date: "2025-12-01", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-02", stables: 44, volatile: 36, validator: 15, lp: 5 },
    { date: "2025-12-03", stables: 46, volatile: 34, validator: 15, lp: 5 },
    { date: "2025-12-04", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-05", stables: 43, volatile: 37, validator: 15, lp: 5 },
    { date: "2025-12-06", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-07", stables: 47, volatile: 33, validator: 15, lp: 5 },
    { date: "2025-12-08", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-09", stables: 44, volatile: 36, validator: 15, lp: 5 },
    { date: "2025-12-10", stables: 46, volatile: 34, validator: 15, lp: 5 },
    { date: "2025-12-11", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-12", stables: 43, volatile: 37, validator: 15, lp: 5 },
    { date: "2025-12-13", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-14", stables: 47, volatile: 33, validator: 15, lp: 5 },
    { date: "2025-12-15", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-16", stables: 44, volatile: 36, validator: 15, lp: 5 },
    { date: "2025-12-17", stables: 46, volatile: 34, validator: 15, lp: 5 },
    { date: "2025-12-18", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-19", stables: 43, volatile: 37, validator: 15, lp: 5 },
    { date: "2025-12-20", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-21", stables: 47, volatile: 33, validator: 15, lp: 5 },
    { date: "2025-12-22", stables: 45, volatile: 35, validator: 15, lp: 5 },
    { date: "2025-12-23", stables: 44, volatile: 36, validator: 15, lp: 5 },
    { date: "2025-12-24", stables: 45, volatile: 35, validator: 15, lp: 5 }
  ]
};

export type MockData = typeof mockData;
export type Treasury = typeof mockData.treasuries.liquidBacking;
export type Asset = typeof mockData.treasuries.liquidBacking.assets[0];
export type Validator = typeof mockData.validator;
export type RewardVault = typeof mockData.rewardVault;
export type TreasuryHistoryItem = typeof mockData.treasuryHistory[0];
export type WeeklyDetail = typeof mockData.rewardVault.weeklyDetails[0];
