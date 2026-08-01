// server/board-data.js

const COLOR_GROUPS = {
    BROWN: '#8B4513',
    LIGHT_BLUE: '#87CEEB',
    PINK: '#FF69B4',
    ORANGE: '#FFA500',
    RED: '#FF2D7B',
    YELLOW: '#FFD700',
    GREEN: '#00E87B',
    DARK_BLUE: '#0080FF',
    RAILROAD: '#A0A0A0',
    UTILITY: '#00D4FF'
};

const BOARD_SPACES = [
    { id: 0, name: "GO", type: "CORNER", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 1, name: "Mediterranean Ave", type: "PROPERTY", group: "BROWN", color: COLOR_GROUPS.BROWN, price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgage: 30 },
    { id: 2, name: "Community Chest", type: "COMMUNITY_CHEST", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 3, name: "Baltic Ave", type: "PROPERTY", group: "BROWN", color: COLOR_GROUPS.BROWN, price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgage: 30 },
    { id: 4, name: "Income Tax", type: "TAX", color: null, amount: 200, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 5, name: "Reading Railroad", type: "RAILROAD", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 6, name: "Oriental Ave", type: "PROPERTY", group: "LIGHT_BLUE", color: COLOR_GROUPS.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
    { id: 7, name: "Chance", type: "CHANCE", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 8, name: "Vermont Ave", type: "PROPERTY", group: "LIGHT_BLUE", color: COLOR_GROUPS.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
    { id: 9, name: "Connecticut Ave", type: "PROPERTY", group: "LIGHT_BLUE", color: COLOR_GROUPS.LIGHT_BLUE, price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgage: 60 },
    { id: 10, name: "Jail / Visiting", type: "CORNER", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 11, name: "St. Charles Place", type: "PROPERTY", group: "PINK", color: COLOR_GROUPS.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
    { id: 12, name: "Electric Company", type: "UTILITY", group: "UTILITY", color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0, mortgage: 75 },
    { id: 13, name: "States Ave", type: "PROPERTY", group: "PINK", color: COLOR_GROUPS.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
    { id: 14, name: "Virginia Ave", type: "PROPERTY", group: "PINK", color: COLOR_GROUPS.PINK, price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgage: 80 },
    { id: 15, name: "Pennsylvania RR", type: "RAILROAD", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 16, name: "St. James Place", type: "PROPERTY", group: "ORANGE", color: COLOR_GROUPS.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
    { id: 17, name: "Community Chest", type: "COMMUNITY_CHEST", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 18, name: "Tennessee Ave", type: "PROPERTY", group: "ORANGE", color: COLOR_GROUPS.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
    { id: 19, name: "New York Ave", type: "PROPERTY", group: "ORANGE", color: COLOR_GROUPS.ORANGE, price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgage: 100 },
    { id: 20, name: "Free Parking", type: "CORNER", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 21, name: "Kentucky Ave", type: "PROPERTY", group: "RED", color: COLOR_GROUPS.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
    { id: 22, name: "Chance", type: "CHANCE", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 23, name: "Indiana Ave", type: "PROPERTY", group: "RED", color: COLOR_GROUPS.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
    { id: 24, name: "Illinois Ave", type: "PROPERTY", group: "RED", color: COLOR_GROUPS.RED, price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgage: 120 },
    { id: 25, name: "B. & O. Railroad", type: "RAILROAD", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 26, name: "Atlantic Ave", type: "PROPERTY", group: "YELLOW", color: COLOR_GROUPS.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
    { id: 27, name: "Ventnor Ave", type: "PROPERTY", group: "YELLOW", color: COLOR_GROUPS.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
    { id: 28, name: "Water Works", type: "UTILITY", group: "UTILITY", color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0, mortgage: 75 },
    { id: 29, name: "Marvin Gardens", type: "PROPERTY", group: "YELLOW", color: COLOR_GROUPS.YELLOW, price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgage: 140 },
    { id: 30, name: "Go To Jail", type: "CORNER", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 31, name: "Pacific Ave", type: "PROPERTY", group: "GREEN", color: COLOR_GROUPS.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
    { id: 32, name: "North Carolina Ave", type: "PROPERTY", group: "GREEN", color: COLOR_GROUPS.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
    { id: 33, name: "Community Chest", type: "COMMUNITY_CHEST", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 34, name: "Pennsylvania Ave", type: "PROPERTY", group: "GREEN", color: COLOR_GROUPS.GREEN, price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgage: 160 },
    { id: 35, name: "Short Line RR", type: "RAILROAD", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 36, name: "Chance", type: "CHANCE", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 37, name: "Park Place", type: "PROPERTY", group: "DARK_BLUE", color: COLOR_GROUPS.DARK_BLUE, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgage: 175 },
    { id: 38, name: "Luxury Tax", type: "TAX", color: null, amount: 100, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 39, name: "Boardwalk", type: "PROPERTY", group: "DARK_BLUE", color: COLOR_GROUPS.DARK_BLUE, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgage: 200 }
];

const CHANCE_CARDS = [
    { text: "Advance to GO (Collect $200)", action: "MOVE_TO", target: 0, collectGo: true },
    { text: "Advance to Illinois Ave", action: "MOVE_TO", target: 24, collectGo: true },
    { text: "Advance to St. Charles Place", action: "MOVE_TO", target: 11, collectGo: true },
    { text: "Advance to nearest Utility", action: "NEAREST_UTILITY" },
    { text: "Advance to nearest Railroad", action: "NEAREST_RAILROAD" },
    { text: "Bank pays you dividend of $50", action: "GAIN_MONEY", amount: 50 },
    { text: "Get Out of Jail Free card", action: "GET_JAIL_CARD" },
    { text: "Go Back 3 Spaces", action: "MOVE_RELATIVE", amount: -3 },
    { text: "Go to Jail! Do not pass GO, do not collect $200", action: "GO_TO_JAIL" },
    { text: "Make general repairs: Pay $25 per house, $100 per hotel", action: "REPAIRS", house: 25, hotel: 100 },
    { text: "Pay speed fine of $15", action: "PAY_MONEY", amount: 15 },
    { text: "Take a trip to Reading Railroad", action: "MOVE_TO", target: 5, collectGo: true },
    { text: "You have been elected Chairman of the Board. Pay each player $50", action: "PAY_EACH", amount: 50 },
    { text: "Your building loan matures. Collect $150", action: "GAIN_MONEY", amount: 150 }
];

const COMMUNITY_CHEST_CARDS = [
    { text: "Advance to GO (Collect $200)", action: "MOVE_TO", target: 0, collectGo: true },
    { text: "Bank error in your favor. Collect $200", action: "GAIN_MONEY", amount: 200 },
    { text: "Doctor's fee. Pay $50", action: "PAY_MONEY", amount: 50 },
    { text: "From sale of stock you get $50", action: "GAIN_MONEY", amount: 50 },
    { text: "Get Out of Jail Free card", action: "GET_JAIL_CARD" },
    { text: "Go to Jail! Do not pass GO", action: "GO_TO_JAIL" },
    { text: "Holiday fund matures. Receive $100", action: "GAIN_MONEY", amount: 100 },
    { text: "Income tax refund. Collect $20", action: "GAIN_MONEY", amount: 20 },
    { text: "It is your birthday. Collect $10 from every player", action: "COLLECT_EACH", amount: 10 },
    { text: "Life insurance matures. Collect $100", action: "GAIN_MONEY", amount: 100 },
    { text: "Pay hospital fees of $100", action: "PAY_MONEY", amount: 100 },
    { text: "Pay school fees of $50", action: "PAY_MONEY", amount: 50 },
    { text: "Receive $25 consultancy fee", action: "GAIN_MONEY", amount: 25 },
    { text: "You are assessed for street repairs: $40 per house, $115 per hotel", action: "REPAIRS", house: 40, hotel: 115 },
    { text: "You have won second prize in a beauty contest. Collect $10", action: "GAIN_MONEY", amount: 10 },
    { text: "You inherit $100", action: "GAIN_MONEY", amount: 100 }
];

const TOKENS = [
    { id: 'car', name: 'Racecar', icon: '🏎️', color: '#FF2D7B' },
    { id: 'hat', name: 'Top Hat', icon: '🎩', color: '#00D4FF' },
    { id: 'dog', name: 'Scottie Dog', icon: '🐕', color: '#00E87B' },
    { id: 'ship', name: 'Battleship', icon: '🚢', color: '#FFD700' },
    { id: 'cat', name: 'Cat', icon: '🐱', color: '#9B51E0' },
    { id: 'thimble', name: 'Thimble', icon: '🧵', color: '#FF7A00' }
];

module.exports = {
    COLOR_GROUPS,
    BOARD_SPACES,
    CHANCE_CARDS,
    COMMUNITY_CHEST_CARDS,
    TOKENS
};
