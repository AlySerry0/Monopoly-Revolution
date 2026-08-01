// client/js/constants.js — Monopoly Revolution Official 75th Anniversary Edition Data

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

const ZONES = {
    WALKING: { name: 'WALKING ZONE', color: '#00D4FF', start: 1, end: 9, icon: '🚶' },
    CYCLE: { name: 'CYCLE ZONE', color: '#00E87B', start: 11, end: 19, icon: '🚲' },
    CAR: { name: 'CAR ZONE', color: '#FFD700', start: 21, end: 29, icon: '🏎️' },
    ROCKET: { name: 'ROCKET ZONE', color: '#FF2D7B', start: 31, end: 39, icon: '🚀' }
};

const BOARD_SPACES = [
    { id: 0, name: "GO", type: "CORNER", zone: null, color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 1, name: "Mediterranean Ave", type: "PROPERTY", zone: "WALKING", group: "BROWN", color: COLOR_GROUPS.BROWN, price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgage: 30 },
    { id: 2, name: "Community Chest", type: "COMMUNITY_CHEST", zone: "WALKING", color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 3, name: "Baltic Ave", type: "PROPERTY", zone: "WALKING", group: "BROWN", color: COLOR_GROUPS.BROWN, price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgage: 30 },
    { id: 4, name: "Income Tax", type: "TAX", zone: "WALKING", color: null, amount: 200, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 5, name: "Reading Railroad", type: "RAILROAD", zone: "WALKING", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 6, name: "Oriental Ave", type: "PROPERTY", zone: "WALKING", group: "LIGHT_BLUE", color: COLOR_GROUPS.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
    { id: 7, name: "WALKING ZONE SPACE", type: "ZONE_SPACE", zone: "WALKING", color: "#00D4FF", price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 8, name: "Vermont Ave", type: "PROPERTY", zone: "WALKING", group: "LIGHT_BLUE", color: COLOR_GROUPS.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
    { id: 9, name: "Connecticut Ave", type: "PROPERTY", zone: "WALKING", group: "LIGHT_BLUE", color: COLOR_GROUPS.LIGHT_BLUE, price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgage: 60 },
    { id: 10, name: "Jail / Visiting", type: "CORNER", zone: null, color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 11, name: "St. Charles Place", type: "PROPERTY", zone: "CYCLE", group: "PINK", color: COLOR_GROUPS.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
    { id: 12, name: "Electric Company", type: "UTILITY", zone: "CYCLE", group: "UTILITY", color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0, mortgage: 75 },
    { id: 13, name: "States Ave", type: "PROPERTY", zone: "CYCLE", group: "PINK", color: COLOR_GROUPS.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
    { id: 14, name: "Virginia Ave", type: "PROPERTY", zone: "CYCLE", group: "PINK", color: COLOR_GROUPS.PINK, price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgage: 80 },
    { id: 15, name: "Gas Works", type: "UTILITY", zone: "CYCLE", group: "UTILITY", color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0, mortgage: 75 },
    { id: 16, name: "St. James Place", type: "PROPERTY", zone: "CYCLE", group: "ORANGE", color: COLOR_GROUPS.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
    { id: 17, name: "CYCLE ZONE SPACE", type: "ZONE_SPACE", zone: "CYCLE", color: "#00E87B", price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 18, name: "Tennessee Ave", type: "PROPERTY", zone: "CYCLE", group: "ORANGE", color: COLOR_GROUPS.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
    { id: 19, name: "New York Ave", type: "PROPERTY", zone: "CYCLE", group: "ORANGE", color: COLOR_GROUPS.ORANGE, price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgage: 100 },
    { id: 20, name: "Free Parking", type: "CORNER", zone: null, color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 21, name: "Kentucky Ave", type: "PROPERTY", zone: "CAR", group: "RED", color: COLOR_GROUPS.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
    { id: 22, name: "CAR ZONE SPACE", type: "ZONE_SPACE", zone: "CAR", color: "#FFD700", price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 23, name: "Indiana Ave", type: "PROPERTY", zone: "CAR", group: "RED", color: COLOR_GROUPS.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
    { id: 24, name: "Illinois Ave", type: "PROPERTY", zone: "CAR", group: "RED", color: COLOR_GROUPS.RED, price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgage: 120 },
    { id: 25, name: "B. & O. Railroad", type: "RAILROAD", zone: "CAR", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 26, name: "Atlantic Ave", type: "PROPERTY", zone: "CAR", group: "YELLOW", color: COLOR_GROUPS.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
    { id: 27, name: "Ventnor Ave", type: "PROPERTY", zone: "CAR", group: "YELLOW", color: COLOR_GROUPS.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
    { id: 28, name: "Water Works", type: "UTILITY", zone: "CAR", group: "UTILITY", color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0, mortgage: 75 },
    { id: 29, name: "Marvin Gardens", type: "PROPERTY", zone: "CAR", group: "YELLOW", color: COLOR_GROUPS.YELLOW, price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgage: 140 },
    { id: 30, name: "Go To Jail", type: "CORNER", zone: null, color: null, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 31, name: "Pacific Ave", type: "PROPERTY", zone: "ROCKET", group: "GREEN", color: COLOR_GROUPS.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
    { id: 32, name: "North Carolina Ave", type: "PROPERTY", zone: "ROCKET", group: "GREEN", color: COLOR_GROUPS.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
    { id: 33, name: "Solar Energy", type: "UTILITY", zone: "ROCKET", group: "UTILITY", color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0, mortgage: 75 },
    { id: 34, name: "Pennsylvania Ave", type: "PROPERTY", zone: "ROCKET", group: "GREEN", color: COLOR_GROUPS.GREEN, price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgage: 160 },
    { id: 35, name: "Short Line RR", type: "RAILROAD", zone: "ROCKET", group: "RAILROAD", color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100 },
    { id: 36, name: "ROCKET ZONE SPACE", type: "ZONE_SPACE", zone: "ROCKET", color: "#FF2D7B", price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 37, name: "Park Place", type: "PROPERTY", zone: "ROCKET", group: "DARK_BLUE", color: COLOR_GROUPS.DARK_BLUE, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgage: 175 },
    { id: 38, name: "Luxury Tax", type: "TAX", zone: "ROCKET", color: null, amount: 100, price: 0, rent: [0], houseCost: 0, mortgage: 0 },
    { id: 39, name: "Boardwalk", type: "PROPERTY", zone: "ROCKET", group: "DARK_BLUE", color: COLOR_GROUPS.DARK_BLUE, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgage: 200 }
];

const TOKENS = [
    { id: 'car', name: 'Racecar', icon: '🏎️', color: '#FF2D7B' },
    { id: 'hat', name: 'Top Hat', icon: '🎩', color: '#00D4FF' },
    { id: 'dog', name: 'Scottie Dog', icon: '🐕', color: '#00E87B' },
    { id: 'ship', name: 'Battleship', icon: '🚢', color: '#FFD700' },
    { id: 'cat', name: 'Cat', icon: '🐱', color: '#9B51E0' },
    { id: 'thimble', name: 'Thimble', icon: '🧵', color: '#FF7A00' }
];
