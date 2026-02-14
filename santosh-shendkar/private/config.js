// ============================================
// 🔴 INVESTOR PORTAL CONFIGURATION
// LAST UPDATED: February 14, 2026
// ============================================

const GOOGLE_SHEETS_CONFIG = {
    // 🔴 YOUR PUBLISHED GOOGLE SHEET URL (from omkar_investor_master tab)
    CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS1_P53kXXIi0Zo781bTMquJ9UVvgY9oo3TpQnS_BWd1GLz4B5iPqOLcezB5qiB5kww3pAvJ_f1gYZb/pub?output=csv',
    
    // 🔴 MASTER PASSWORD FOR YOUR ACCESS
    MASTER_PASSWORD: 'Omkar@2026',
    
    APP_NAME: 'Santosh Shendkar Investor Portal',
    VERSION: '2.0.0'
};

// ============================================
// 🚀 FETCH AND PARSE FUNCTIONS
// ============================================

async function fetchInvestorData() {
    try {
        // For local testing - use proxy if needed
        const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        const url = isLocal ? 'https://corsproxy.io/?' + encodeURIComponent(GOOGLE_SHEETS_CONFIG.CSV_URL) : GOOGLE_SHEETS_CONFIG.CSV_URL;
        
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        const csvData = await response.text();
        console.log('CSV received. Length:', csvData.length);
        
        return parseInvestorCSV(csvData);
    } catch (error) {
        console.error('Failed to fetch investor data:', error);
        return null;
    }
}

function parseInvestorCSV(csv) {
    const lines = csv.split('\n');
    console.log('Total lines in CSV:', lines.length);
    
    let investors = {};
    let totalAUM = 0;
    let investorCount = 0;
    let totalMonthlyPayout = 0;
    
    // Track unique investors by name + mobile combination
    let uniqueInvestors = new Set();
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const row = lines[i].split(',');
        
        // Column B: Investor Name
        const name = row[1]?.trim() || '';
        
        // Column C: Mobile Number
        const mobileRaw = row[2]?.trim() || '';
        const mobile = mobileRaw.replace(/[^0-9]/g, '').slice(-10);
        
        // Column E: Principal Amount
        const principal = parseFloat(row[4]) || 0;
        
        // Column F: ROI % (remove % sign if present)
        const rateStr = row[5]?.trim() || '0';
        const rate = parseFloat(rateStr.replace('%', '')) || 0;
        
        if (name && principal > 0) {
            // Create unique key from name + mobile
            const uniqueKey = `${name}_${mobile}`;
            
            if (!uniqueInvestors.has(uniqueKey)) {
                uniqueInvestors.add(uniqueKey);
                investorCount++;
            }
            
            // Store investor data
            if (!investors[uniqueKey]) {
                investors[uniqueKey] = {
                    name: name,
                    mobile: mobile,
                    investments: [],
                    totalPrincipal: 0
                };
            }
            
            // Add investment
            investors[uniqueKey].investments.push({
                date: row[3]?.trim() || '', // Column D: Date
                principal: principal,
                rate: rate
            });
            investors[uniqueKey].totalPrincipal += principal;
            
            // Add to totals
            totalAUM += principal;
            
            // Calculate monthly payout
            const monthlyPayout = (principal * rate / 100) / 12;
            totalMonthlyPayout += monthlyPayout;
        }
    }
    
    console.log('Unique investors found:', investorCount);
    console.log('Total AUM:', totalAUM);
    console.log('Total Monthly Payout:', totalMonthlyPayout);
    
    return {
        investors: investors,
        totalAUM: totalAUM,
        investorCount: investorCount,
        totalMonthlyPayout: totalMonthlyPayout
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}