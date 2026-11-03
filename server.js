const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

// Asset model scaled to exactly $95,000,000 total capital pool
const portfolioModel = [
  { 
    asset: 'Bitcoin (BTC)', 
    category: 'Foundational Layer', 
    targetWeight: 0.50, 
    holding: 617.6853, 
    currentPrice: 76900,
    about: 'Held under the Sterling Generational Family Trust as an inflation-hedged long-term store of value for beneficiaries.'
  },
  { 
    asset: 'Ethereum / Solana', 
    category: 'Execution Layer', 
    targetWeight: 0.30, 
    holding: 11632.653, 
    currentPrice: 2450,
    about: 'Allocated to smart contract execution mandates governed by testamentary trust provisions and automated beneficiary distribution schedules.'
  },
  { 
    asset: 'Application Protocols', 
    category: 'Tactical Layer', 
    targetWeight: 0.15, 
    holding: 118750, 
    currentPrice: 120,
    about: 'Tactical yield-generating digital assets managed under fiduciary oversight to support ongoing estate growth and administrative requirements.'
  },
  { 
    asset: 'Stablecoins (USDT/USDC)', 
    category: 'Opportunity Reserve', 
    targetWeight: 0.05, 
    holding: 4750000, 
    currentPrice: 1.0,
    about: 'Segregated fiduciary liquidity buffer maintained specifically for immediate will execution, estate tax liabilities, and legal disbursements.'
  }
];

// Secure Trustee Database Records
const trusteeDatabase = [
  {
    name: "lily reynolds",
    dob: "1988-01-01",
    availableBalance: 7000000.00,
    trustDeed: "SC-TRUST-7M-089"
  },
  {
    name: "janet anderson",
    dob: "1992-06-11",
    availableBalance: 7000000.00,
    trustDeed: "SC-TRUST-7M-090"
  },
  {
    name: "lilian rice",
    dob: "1992-07-11",
    availableBalance: 7000000.00,
    trustDeed: "SC-TRUST-7M-091"
  }
];

// Secure Server Side Authorization Seed Phrase
const correctSeed = "stratum capital anchor quantum beacon ledger horizon prime stellar matrix nexus kinetic summit vortex";

app.get('/api/portfolio', (req, res) => {
    const valuation = portfolioModel.map(item => ({
        ...item,
        totalValue: item.holding * item.currentPrice
    }));
    
    const totalPortfolioValue = valuation.reduce((sum, item) => sum + item.totalValue, 0);

    const breakdown = valuation.map(item => ({
        ...item,
        actualWeight: totalPortfolioValue > 0 ? (item.totalValue / totalPortfolioValue) : 0
    }));

    res.json({
        totalValue: totalPortfolioValue,
        allocations: breakdown
    });
});

app.post('/api/verify-trustee', (req, res) => {
    const { name, dob } = req.body;
    if (!name || !dob) {
        return res.json({ success: false, message: "Missing identity parameters." });
    }

    const matchedTrustee = trusteeDatabase.find(t => t.name === name.trim().toLowerCase() && t.dob === dob);

    if (matchedTrustee) {
        res.json({
            success: true,
            balance: matchedTrustee.availableBalance,
            trustDeed: matchedTrustee.trustDeed
        });
    } else {
        res.json({
            success: false,
            message: "No active trust record found matching credentials."
        });
    }
});

app.post('/api/verify-seed', (req, res) => {
    const { seed } = req.body;
    if (!seed) {
        return res.json({ success: false, message: "Missing seed phrase parameter." });
    }

    const normalizedSeed = seed.trim().toLowerCase();
    if (normalizedSeed === correctSeed) {
        res.json({ success: true, message: "Passphrase authenticated successfully." });
    } else {
        res.json({ success: false, message: "Invalid recovery sequence." });
    }
});

app.listen(PORT, () => {
    console.log(`StratumCapital running at http://localhost:${PORT}`);
});