const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
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
    dob: "1992-11-06",
    availableBalance: 7000000.00,
    trustDeed: "SC-TRUST-7M-090"
  },
  {
    name: "lilian rice",
    dob: "1992-11-07",
    availableBalance: 7000000.00,
    trustDeed: "SC-TRUST-7M-091"
  },
  {
    name: "janet jackson",
    dob: "1992-11-06",
    availableBalance: 7000000.00,
    trustDeed: "SC-TRUST-7M-092"
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

const parseDate = value => {
    if (typeof value !== 'string') {
        return [];
    }

    const trimmedValue = value.trim();
    const createDate = (year, month, day) => {
        year = Number(year);
        month = Number(month);
        day = Number(day);

        if (year < 1 || year > 9999 || month < 1 || month > 12) {
            return null;
        }

        const daysInMonth = [
            31,
            year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
            31, 30, 31, 30, 31, 31, 30, 31, 30, 31
        ][month - 1];

        if (day < 1 || day > daysInMonth) {
            return null;
        }

        const date = new Date(0);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCFullYear(year, month - 1, day);
        return date;
    };

    const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmedValue);
    if (isoDate) {
        const date = createDate(isoDate[1], isoDate[2], isoDate[3]);
        return date ? [date] : [];
    }

    const monthNames = {
        jan: '01', january: '01',
        feb: '02', february: '02',
        mar: '03', march: '03',
        apr: '04', april: '04',
        may: '05',
        jun: '06', june: '06',
        jul: '07', july: '07',
        aug: '08', august: '08',
        sep: '09', sept: '09', september: '09',
        oct: '10', october: '10',
        nov: '11', november: '11',
        dec: '12', december: '12'
    };

    const namedDate = /^(?:(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?,?|([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?)\s+(\d{4})$/i.exec(trimmedValue);
    if (namedDate) {
        const day = (namedDate[1] || namedDate[4]).padStart(2, '0');
        const monthName = (namedDate[2] || namedDate[3]).toLowerCase();
        const month = monthNames[monthName];
        const date = month && createDate(namedDate[5], month, day);
        return date ? [date] : [];
    }

    const numericDate = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/.exec(trimmedValue);
    if (!numericDate) {
        return [];
    }

    const [, first, second, year] = numericDate;
    const dates = [
        createDate(year, second, first),
        createDate(year, first, second)
    ].filter((date, index, candidates) =>
        date && candidates.findIndex(candidate =>
            candidate && candidate.getTime() === date.getTime()
        ) === index
    );

    return dates;
};

app.post('/api/verify-trustee', (req, res) => {
    const { name, dob } = req.body;
    if (!name || !dob) {
        return res.json({ success: false, message: "Missing identity parameters." });
    }

    const normalizedName = name.trim().toLowerCase();
    const inputDates = parseDate(dob);
    const matchedTrustee = trusteeDatabase.find(
        t => {
            const recordDates = parseDate(t.dob);
            return t.name.trim().toLowerCase() === normalizedName &&
                inputDates.some(inputDate =>
                    recordDates.some(recordDate => inputDate.getTime() === recordDate.getTime())
                );
        }
    );

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

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`StratumCapital listening on 0.0.0.0:${PORT}`);
});

// Graceful shutdown: Railway sends SIGTERM on redeploy/stop.
const shutdown = signal => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 8000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
