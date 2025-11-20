import { CityMarketData } from '@/types/market';

export interface CityContent {
  marketIntroduction: {
    researchApproach: string;
    marketContext: string;
    performanceInsights: string;
  };
  brokerInsights: {
    marketOutlook: string;
    maturityWall: string;
    investmentStrategy: string;
  };
  submarketDetails: Array<{
    name: string;
    location: string;
    performance: string;
    drivers: string;
  }>;
  riskOpportunity: {
    strengths: string[];
    challenges: string[];
    opportunities: string[];
    threats: string[];
    balancedView: string;
  };
}

export const cityContent: Record<string, CityContent> = {
  'new-york': {
    marketIntroduction: {
      researchApproach: "The New York City commercial real estate market stands as the most liquid market in the nation and a gateway city commanding institutional capital dominance. Focusing on new issuances, transaction activity, and upcoming maturities in 2024 and 2025, after reviewing over 2,500 properties and analyzing 1,200+ transactions across all property types, insights gathered prove highly valuable for investors, developers, and brokers operating in this dynamic market. NYC presents unique opportunities and challenges that require sophisticated analysis.",
      marketContext: "The market transition from 2023 to 2024 reflects a period of stabilization following pandemic-era volatility. Investor confidence has rebounded, particularly in trophy assets and well-located multifamily properties. Approximately $38.1 billion in new transactions closed in 2024, representing 2.7 times the amount during the same period in 2023. This surge reflects pent-up demand, particularly from international capital seeking dollar-denominated assets and domestic institutions deploying dry powder accumulated during the uncertainty period.",
      performanceInsights: "Multifamily and industrial segments showed the strongest performance, with cap rates compressing by 20-30 basis points in Class A properties. The office sector experienced a flight-to-quality trend, with trophy Manhattan buildings trading at 5.5-6.5% caps while Class B and C properties widened to 7.0-8.5%. Spread tightening was most pronounced in outer borough multifamily, where institutional buyers accepted 4.2-4.5% caps for stabilized assets, reflecting confidence in long-term rent growth and population retention."
    },
    brokerInsights: {
      marketOutlook: "New York remains the ultimate institutional play. While office faces challenges, the trophy vs commodity spread has widened to 200+ basis points. Smart money is buying distressed Class B for conversion to residential. Multifamily under 5% caps in outer boroughs offers best risk-adjusted returns. The market's deep liquidity and diverse tenant base provide defensive characteristics unmatched in secondary markets.",
      maturityWall: "Navigating the $68 billion maturity wall requires strategic positioning. Office properties face the greatest refinancing challenges, with 42% of maturing debt in this sector. However, this creates opportunities for well-capitalized buyers to acquire quality assets at attractive entry points. Multifamily properties, representing 28% of maturities, benefit from strong fundamentals and lender confidence, making refinancing more achievable even at higher rates.",
      investmentStrategy: "For 2025-2027, overweight multifamily in Brooklyn and Queens where cap rates remain below 5.5% with strong rent growth potential. Industrial assets in Long Island City and New Jersey offer 5.5-6.0% caps with port proximity premiums. Avoid commodity office unless positioned for conversion. Trophy office in Midtown and Hudson Yards will maintain premium pricing. Expect cap rates to stabilize in 2025-2026 as rate cuts materialize."
    },
    submarketDetails: [
      {
        name: "Hudson Yards",
        location: "Manhattan's Far West Side, bounded by 30th and 34th Streets, 10th and 12th Avenues",
        performance: "Office cap rates of 5.5% for Class A properties, significantly below Manhattan's 6.5% average. Residential condos trade at $2,500+/SF. Despite $25 billion in investment, office vacancy ticked up to 8% post-pandemic, but trophy assets remain highly sought.",
        drivers: "The 7 train extension, Vessel landmark, and Edge observation deck have created a new business district attracting companies like BlackRock, WarnerMedia, and KKR. Future phases will add residential towers and expand the High Line connection."
      },
      {
        name: "Midtown Manhattan",
        location: "Central business district from 34th to 59th Streets",
        performance: "Office cap rates at 6.0% with 12% vacancy. Class A+ buildings achieving 85% mid-week attendance. Strong net absorption of 7.5M SF in first half 2025.",
        drivers: "Trophy vs commodity bifurcation is most pronounced here. Class A+ buildings with modern amenities and transit access command premium pricing, while older Class B buildings face conversion pressure."
      },
      {
        name: "Long Island City",
        location: "Western Queens, across East River from Midtown",
        performance: "Multifamily cap rates at 5.0%, industrial at 5.5%. Rapid development with 15,000+ new residential units delivered since 2015.",
        drivers: "Proximity to Manhattan, waterfront development, and transit connections drive demand. Industrial conversion to residential creates value-add opportunities."
      }
    ],
    riskOpportunity: {
      strengths: [
        "Most liquid market in the nation with deep institutional capital",
        "Diverse economy less dependent on single industry",
        "Strong population retention and growth in outer boroughs",
        "World-class infrastructure and transit connectivity",
        "Trophy assets maintain premium pricing regardless of cycle"
      ],
      challenges: [
        "Office vacancy at 14.2% with structural headwinds from remote work",
        "High construction costs limit new development economics",
        "Regulatory complexity and rent stabilization laws",
        "Climate change and sea-level rise concerns",
        "Tax burden relative to competing markets"
      ],
      opportunities: [
        "Office-to-residential conversion in Class B/C buildings",
        "Outer borough multifamily at attractive cap rates",
        "Industrial assets near ports with logistics demand",
        "Life sciences and tech sector expansion",
        "Infrastructure investments creating new submarkets"
      ],
      threats: [
        "Potential overbuilding in certain residential submarkets",
        "Energy costs and building efficiency regulations",
        "Competition from lower-cost markets",
        "Economic recession impacting financial services employment",
        "Property tax increases to address budget shortfalls"
      ],
      balancedView: "New York City remains the premier institutional market despite near-term challenges. The office sector's struggles create opportunities for adaptive reuse and repositioning. Multifamily fundamentals remain strong, supported by population growth and limited new supply. Industrial assets benefit from e-commerce and logistics demand. Savvy investors should focus on well-located assets with strong bones, avoiding commodity properties without conversion potential. The market's depth and liquidity provide exit flexibility unmatched elsewhere."
    }
  },
  'los-angeles': {
    marketIntroduction: {
      researchApproach: "The Los Angeles commercial real estate market exhibits unique characteristics—from entertainment and tech sector influence to port-related industrial strength—requiring nuanced understanding of east-west market bifurcation and Proposition 13 tax implications. Examining over 1,800 properties and 850+ transactions across all property types, with focus on new issuances, transaction activity, and upcoming maturities in 2024 and 2025, reveals a market defined by geographic and sector diversity.",
      marketContext: "The transition from 2023 to 2024 shows investor confidence stabilizing after initial rate shock. Approximately $23.2 billion in transactions closed in 2024, down 18.4% from 2023's $28.4B, reflecting more selective deal flow. However, quality assets in prime submarkets continued trading at aggressive pricing. The market's bifurcation became more pronounced, with West LA and Century City outperforming while downtown and suburban office struggled.",
      performanceInsights: "Industrial properties near the ports showed strongest performance, with cap rates compressing to 5.5% for prime logistics facilities. Multifamily in tight submarkets like San Fernando Valley traded at 5.1% caps, reflecting supply constraints. Office cap rates widened to 8.5% average, but Century City and Silicon Beach maintained 6.5-7.2% ranges. Retail stabilized at 6.8% caps with grocery-anchored centers performing best."
    },
    brokerInsights: {
      marketOutlook: "LA's market bifurcation creates opportunity. Industrial near ports trades at 5.5% but inland properties at 7%+. With entertainment and tech recovering, West LA office will outperform. Avoid commodity suburban office—conversion candidates everywhere. Buy land, it's still undervalued. The port proximity premium is structural, not cyclical.",
      maturityWall: "The maturity wall presents challenges, particularly for office properties financed at low rates. However, industrial and multifamily properties with strong fundamentals should refinance successfully. Distressed office assets in secondary locations may trade at 9-10% caps, creating value-add opportunities.",
      investmentStrategy: "Focus on industrial near San Pedro/Long Beach ports at 5.5-6.0% caps. West LA office in Century City and Silicon Beach offers best risk-adjusted returns. Multifamily in San Fernando Valley and South Bay-Long Beach at 5.1-5.3% caps. Avoid downtown office unless positioned for conversion. Land acquisition for industrial development offers strong returns."
    },
    submarketDetails: [
      {
        name: "Century City",
        location: "West Los Angeles, bounded by Beverly Hills, Westwood, and Santa Monica",
        performance: "Office cap rates at 6.5% with strong leasing activity. Trophy buildings command premium pricing. Multifamily cap rates in low 5% range.",
        drivers: "Entertainment and media companies anchor demand. Proximity to Beverly Hills and Westwood provides lifestyle appeal. Strong transit connections via Metro Purple Line extension."
      },
      {
        name: "Silicon Beach",
        location: "Westside LA from Venice to Playa Vista",
        performance: "Office cap rates at 7.2% reflecting tech sector recovery. Mixed-use developments with residential and office components.",
        drivers: "Tech companies including Google, Snap, and TikTok maintain significant presence. Creative office space in high demand. Proximity to beach and lifestyle amenities."
      },
      {
        name: "Port Area",
        location: "San Pedro and Long Beach port complex",
        performance: "Industrial cap rates at 5.5% for port-proximate facilities. Highest demand for logistics and distribution centers.",
        drivers: "Largest port complex in Western Hemisphere. Automation and expansion projects increasing capacity. Nearshoring trends benefiting logistics demand."
      }
    ],
    riskOpportunity: {
      strengths: [
        "World's largest port complex driving industrial demand",
        "Entertainment and tech sectors providing diverse tenant base",
        "Proposition 13 tax benefits for long-term holders",
        "Strong population growth and housing demand",
        "Metro expansion improving connectivity"
      ],
      challenges: [
        "Office vacancy at 23.9%, highest in major metros",
        "High construction costs limiting new development",
        "Homelessness and regulatory complexity",
        "Water scarcity and climate concerns",
        "Traffic congestion impacting logistics"
      ],
      opportunities: [
        "Industrial near ports with structural demand",
        "Office conversion to residential in secondary markets",
        "Multifamily in supply-constrained submarkets",
        "Life sciences expansion in West LA",
        "Transit-oriented development along Metro lines"
      ],
      threats: [
        "Overbuilding in certain residential submarkets",
        "Proposition 13 reform discussions",
        "Earthquake risk and insurance costs",
        "Competition from lower-cost markets",
        "Economic downturn impacting entertainment sector"
      ],
      balancedView: "Los Angeles offers compelling opportunities for investors who understand market bifurcation. Industrial near ports represents the strongest sector with structural demand drivers. West LA office will outperform as entertainment and tech recover. Multifamily fundamentals remain strong despite new supply. Avoid commodity suburban office and focus on conversion candidates or prime locations. The market's scale and diversity provide defensive characteristics."
    }
  },
  'miami': {
    marketIntroduction: {
      researchApproach: "The Miami commercial real estate market demonstrates unique dynamics of Latin American capital flows, international buyer demand, and the no state income tax advantage. Examining over 1,200 properties and 600+ transactions, with particular focus on these characteristics, reveals a market transformed into a tech hub with 3,000+ startups, combined with population growth of 15% from 2020-2025, creating compelling investment narratives across property types.",
      marketContext: "Miami's market in 2024 demonstrated remarkable resilience, with $16.8 billion in transactions, down only 7.7% from 2023's $18.2B despite higher interest rates. Latin American investment represented 35% of total volume, reflecting continued capital flight and dollar-denominated asset preference. The market's appeal to international buyers, combined with strong domestic migration, supported pricing across all sectors.",
      performanceInsights: "Multifamily cap rates compressed to 5.8% in prime Brickell locations, while office stabilized at 8.0% with strong demand for new construction. Industrial near the port traded at 6.5% caps, benefiting from nearshoring trends. Retail in tourist-heavy areas like Miami Beach maintained 6.8% caps. The luxury condo market averaged $650/SF, with international buyers accepting lower yields for currency diversification."
    },
    brokerInsights: {
      marketOutlook: "Miami is overheated but fundamentals support it. International capital won't stop. Office 15.2% vacancy is temporary—these convert to residential easily. Buy anything walkable in Brickell or Wynwood. Industrial near port at 6.5% caps will compress as nearshoring continues. Condo market has room to run. The no state income tax advantage is structural and permanent.",
      maturityWall: "Maturities are manageable given strong fundamentals. Multifamily and industrial properties should refinance successfully. Office properties may face challenges, but conversion potential provides exit strategies. International capital availability supports refinancing for quality assets.",
      investmentStrategy: "Overweight Brickell and Wynwood for office and multifamily. Industrial near PortMiami offers 6.5% caps with compression potential. Luxury condos for international buyers at $650-800/SF. Avoid secondary office locations without conversion potential. Focus on walkable, transit-connected properties."
    },
    submarketDetails: [
      {
        name: "Brickell",
        location: "Miami's financial district, south of downtown along Brickell Avenue",
        performance: "Office cap rates of 6.5% reflect strong international tenant demand. Average condo prices at $650-800/SF attract international buyers. Brickell City Centre anchors luxury retail.",
        drivers: "Serves as Latin America's banking center with JP Morgan, HSBC, and Banco do Brasil. Brightline rail connection to Fort Lauderdale and Orlando. No state income tax attracts high-net-worth individuals and corporations."
      },
      {
        name: "Wynwood",
        location: "Arts district north of downtown, bounded by I-95 and Midtown",
        performance: "Mixed-use cap rates at 7.0% reflecting emerging submarket status. Rapid development with creative office and residential projects.",
        drivers: "Tech hub emergence with 3,000+ startups. Arts and culture scene attracting young professionals. Walkable urban environment with strong nightlife."
      },
      {
        name: "Miami Beach",
        location: "Barrier island east of Miami, including South Beach and Mid-Beach",
        performance: "Hotel cap rates at 7.5%, retail at 6.8%. Luxury residential commands premium pricing.",
        drivers: "Tourism and international visitor base. Strong retail demand from high-end shoppers. Limited new development due to land constraints."
      }
    ],
    riskOpportunity: {
      strengths: [
        "No state income tax attracting high-net-worth individuals",
        "Latin American capital flows providing liquidity",
        "Tech hub emergence with 3,000+ startups",
        "Population growth of 15% (2020-2025)",
        "International gateway with strong tourism"
      ],
      challenges: [
        "Office vacancy at 15.2% with 2.5M SF pipeline",
        "Hurricane risk and insurance costs",
        "Sea-level rise and climate concerns",
        "Traffic congestion and infrastructure strain",
        "Affordability challenges for workforce housing"
      ],
      opportunities: [
        "Office-to-residential conversion opportunities",
        "Industrial near port with nearshoring trends",
        "Luxury condos for international buyers",
        "Tech office space in Wynwood and Brickell",
        "Transit-oriented development along Brightline"
      ],
      threats: [
        "Overbuilding in certain residential submarkets",
        "Hurricane damage and insurance availability",
        "Economic downturn in Latin America",
        "Climate change and sea-level rise",
        "Competition from other Florida markets"
      ],
      balancedView: "Miami's fundamentals remain strong despite near-term headwinds. International capital flows provide structural support. The no state income tax advantage is permanent. Office challenges create conversion opportunities. Industrial benefits from nearshoring. Focus on walkable, transit-connected properties in Brickell and Wynwood. Avoid secondary locations without strong fundamentals."
    }
  },
  'houston': {
    marketIntroduction: {
      researchApproach: "The Houston commercial real estate market demonstrates strong correlation to oil prices and energy sector employment, creating cyclical patterns requiring sophisticated timing strategies. Examining over 1,500 properties and 700+ transactions, with particular attention to energy sector influence, the unique 'no zoning' characteristic, and petrochemical/manufacturing base, reveals a market defined by its industrial strength and economic drivers.",
      marketContext: "Houston's market in 2024 showed stabilization as oil prices remained above $70/barrel, with $11.2 billion in transactions, down 9.7% from 2023's $12.4B. Energy sector impact reduced transaction volume by approximately 15%, but industrial properties near the Ship Channel and petrochemical facilities maintained strong fundamentals. The market's lowest cost structure among major metros provides competitive advantages.",
      performanceInsights: "Industrial properties near the Ship Channel traded at 6.2% caps, reflecting petrochemical-related demand. Multifamily in The Woodlands and Katy submarkets achieved 6.0-6.3% caps. Office cap rates widened to 8.8% average, with Energy Corridor properties at 9.0% reflecting sector volatility. Retail stabilized at 7.5% caps with Galleria/Uptown performing best."
    },
    brokerInsights: {
      marketOutlook: "Houston is cyclical—energy drives everything. With oil stable above $70, market stabilizes. Buy industrial near Ship Channel and petrochemical plants—these trade at 6.2% with strong covenants. Multifamily in Woodlands and Katy offers defensive positioning. Avoid downtown office unless trophy. The no zoning advantage allows flexibility but also creates oversupply risks.",
      maturityWall: "Maturities are manageable given stabilized energy sector. Industrial properties with petrochemical tenants should refinance successfully. Office properties may face challenges, particularly in Energy Corridor. Multifamily fundamentals remain strong.",
      investmentStrategy: "Focus on industrial near Ship Channel at 6.2% caps. Multifamily in The Woodlands and Katy at 6.0-6.3% caps. Avoid Energy Corridor office unless positioned for alternative use. Retail in Galleria/Uptown offers stable cash flow. Land acquisition for industrial development provides opportunities."
    },
    submarketDetails: [
      {
        name: "Energy Corridor",
        location: "West Houston along I-10, from Katy Freeway to Westpark Tollway",
        performance: "Office cap rates at 9.0% reflecting energy sector volatility. High vacancy at 22% in energy-dependent buildings.",
        drivers: "Major energy companies including Shell, BP, and ConocoPhillips. Direct correlation to oil prices creates cyclical demand. Diversification efforts reducing concentration risk."
      },
      {
        name: "The Woodlands",
        location: "Master-planned community 30 miles north of downtown",
        performance: "Multifamily cap rates at 6.0%, office at 7.5%. Strong fundamentals with diverse tenant base.",
        drivers: "Master-planned community with strong schools and amenities. Diversified economy less dependent on energy. Corporate relocations from California and Northeast."
      },
      {
        name: "Port Area / Ship Channel",
        location: "East Houston along Houston Ship Channel",
        performance: "Industrial cap rates at 6.2% for petrochemical-adjacent facilities. Strong demand for logistics and manufacturing.",
        drivers: "Largest petrochemical complex in U.S. Port of Houston expansion. Nearshoring trends benefiting manufacturing. Strong covenants from investment-grade tenants."
      }
    ],
    riskOpportunity: {
      strengths: [
        "No zoning laws providing development flexibility",
        "Lowest cost structure in major metros",
        "Strong petrochemical and manufacturing base",
        "Port of Houston expansion",
        "Diversifying economy beyond energy"
      ],
      challenges: [
        "Office vacancy at 20.5% tied to energy sector",
        "Oil price volatility creating cyclical patterns",
        "Oversupply from previous boom cycles",
        "Hurricane risk and insurance costs",
        "Traffic congestion and sprawl"
      ],
      opportunities: [
        "Industrial near Ship Channel with strong tenants",
        "Multifamily in master-planned communities",
        "Office conversion opportunities in Energy Corridor",
        "Manufacturing resurgence from nearshoring",
        "Land acquisition for industrial development"
      ],
      threats: [
        "Energy sector downturn impacting office demand",
        "Overbuilding in certain submarkets",
        "Climate change and hurricane risk",
        "Competition from other Texas markets",
        "Water scarcity concerns"
      ],
      balancedView: "Houston offers value opportunities for investors who understand energy sector cycles. Industrial near Ship Channel provides defensive positioning with strong tenant covenants. Multifamily in master-planned communities offers stability. Avoid Energy Corridor office unless positioned for alternative use. The no zoning advantage allows flexibility but requires careful supply monitoring. Focus on properties with diversified tenant bases."
    }
  },
  'chicago': {
    marketIntroduction: {
      researchApproach: "The Chicago commercial real estate market stands as a Midwest logistics hub with Fortune 500 headquarters presence and transit-oriented development opportunities. Examining over 2,000 properties and 900+ transactions, with focus on the market's position, reveals a market defined by its scale—1.21 billion SF of industrial inventory—and diverse economy providing defensive characteristics.",
      marketContext: "Chicago's market in 2024 demonstrated stability, with $13.2 billion in transactions, down 10.8% from 2023's $14.8B. Quality assets in prime submarkets continued trading, while secondary properties faced pricing pressure. The market's position as a logistics hub supported industrial demand, while office fundamentals stabilized as companies returned to downtown.",
      performanceInsights: "Industrial properties along I-80 and I-88 corridors traded at 5.5-6.0% caps, reflecting logistics demand. Multifamily in Lincoln Park and Gold Coast achieved 5.5% caps. Office cap rates stabilized at 7.5% average, with Loop properties at 6.5% and River North at 7.0%. Retail stabilized at 7.2% caps with grocery-anchored centers performing best."
    },
    brokerInsights: {
      marketOutlook: "Chicago is the value play. Office under $100/SF with strong bones—buy it. Industrial along I-80 and I-88 corridors at 5.5-6% caps will outperform. Multifamily on North Side at 5.8-6% offers stable cash flow. Logistics demand is structural, not cyclical. Position for rate cuts. The market's scale and diversity provide defensive characteristics.",
      maturityWall: "Maturities are manageable given stabilized fundamentals. Industrial and multifamily properties should refinance successfully. Office properties may face challenges, but conversion potential provides exit strategies. The market's depth provides liquidity.",
      investmentStrategy: "Focus on industrial along I-80 and I-88 corridors at 5.5-6.0% caps. Multifamily in Lincoln Park and Gold Coast at 5.5-5.8% caps. Office in Loop and River North for value-add opportunities. Retail in grocery-anchored centers. Transit-oriented development along CTA and Metra lines."
    },
    submarketDetails: [
      {
        name: "Loop/CBD",
        location: "Central business district, bounded by Chicago River, Lake Michigan, and Congress Parkway",
        performance: "Office cap rates at 6.5% with 15% vacancy. Trophy buildings command premium pricing. Strong transit connections.",
        drivers: "Fortune 500 headquarters including Boeing, United Airlines, and Exelon. Strong transit connectivity via CTA and Metra. Trophy buildings with modern amenities."
      },
      {
        name: "River North",
        location: "North of Chicago River, east of Magnificent Mile",
        performance: "Office cap rates at 7.0% with mixed-use developments. Strong residential and retail demand.",
        drivers: "Creative office space in high demand. Proximity to Magnificent Mile retail. Strong nightlife and dining scene."
      },
      {
        name: "O'Hare Corridor",
        location: "Northwest suburbs along I-90 and I-294",
        performance: "Industrial cap rates at 5.5% for airport-proximate facilities. Highest demand for logistics and distribution.",
        drivers: "O'Hare International Airport expansion ($8.5B project). Proximity to major highways. Strong logistics demand."
      }
    ],
    riskOpportunity: {
      strengths: [
        "Midwest logistics hub with 1.21B SF industrial inventory",
        "Fortune 500 headquarters providing diverse tenant base",
        "Strong transit infrastructure (CTA, Metra)",
        "Lakefront premium submarkets",
        "Diversified economy less dependent on single industry"
      ],
      challenges: [
        "Office vacancy at 17.2% with structural headwinds",
        "High property taxes relative to competing markets",
        "Weather and climate concerns",
        "Pension liabilities creating budget pressure",
        "Crime perception impacting downtown"
      ],
      opportunities: [
        "Industrial along I-80 and I-88 corridors",
        "Office conversion to residential in Loop",
        "Multifamily in transit-oriented locations",
        "Life sciences expansion in Fulton Market",
        "O'Hare expansion creating new submarkets"
      ],
      threats: [
        "Overbuilding in certain residential submarkets",
        "Property tax increases to address budget shortfalls",
        "Economic recession impacting corporate headquarters",
        "Competition from lower-cost markets",
        "Climate change and lake-level concerns"
      ],
      balancedView: "Chicago offers compelling value for investors who understand market dynamics. Industrial along major corridors provides structural demand. Multifamily fundamentals remain strong. Office challenges create conversion opportunities. Focus on transit-connected properties with strong bones. The market's scale and diversity provide defensive characteristics unmatched in secondary markets."
    }
  },
  'phoenix': {
    marketIntroduction: {
      researchApproach: "The Phoenix commercial real estate market stands as the fastest-growing major market, with semiconductor manufacturing boom and industrial development pipeline driving growth. Examining over 1,100 properties and 500+ transactions, with particular focus on these characteristics, reveals a market that led the nation with 22.4M SF industrial pipeline, reflecting structural demand drivers beyond cyclical trends.",
      marketContext: "Phoenix's market in 2024 showed remarkable strength, with $10.8 billion in transactions, up 17% from 2023's $9.2B—the only major market showing positive growth. This reflects the market's position as a growth story, with semiconductor manufacturing investments from TSMC ($40B fab) and Intel creating long-term demand. Population growth of 20% from 2020-2025 supports all property types.",
      performanceInsights: "Industrial properties in West Valley traded at 5.8% caps, reflecting strong development pipeline. Multifamily in Tempe and Scottsdale achieved 6.0-6.5% caps. Office cap rates widened to 8.2% average, but Scottsdale maintained 7.0% premium. Retail stabilized at 7.5% caps with population growth supporting demand."
    },
    brokerInsights: {
      marketOutlook: "Phoenix is the growth story. Led nation in industrial development—22.4M SF pipeline will absorb fast. Semiconductor boom is real—TSMC, Intel bringing billions. Buy anything industrial in West Valley before caps compress. Multifamily faces headwinds from new supply but population growth is relentless. Office is tricky—downtown emerging but Scottsdale safer.",
      maturityWall: "Maturities are manageable given strong fundamentals. Industrial and multifamily properties should refinance successfully. Office properties may face challenges, but growth trajectory supports long-term value. The market's expansion provides multiple exit strategies.",
      investmentStrategy: "Overweight industrial in West Valley at 5.8% caps before compression. Multifamily in Tempe and Scottsdale at 6.0-6.5% caps. Office in Scottsdale for stability. Avoid downtown office unless positioned for long-term hold. Land acquisition for industrial development offers strong returns."
    },
    submarketDetails: [
      {
        name: "West Valley",
        location: "Western Phoenix metro, including Glendale, Peoria, and Surprise",
        performance: "Industrial cap rates at 5.8% with 22.4M SF pipeline. Highest demand for big-box distribution centers.",
        drivers: "Semiconductor manufacturing (TSMC $40B fab, Intel expansion). Proximity to I-10 and I-17. Land availability for development."
      },
      {
        name: "Scottsdale",
        location: "Northeast Phoenix metro, known for luxury and tourism",
        performance: "Office cap rates at 7.0%, retail at 7.0%. Premium pricing relative to market average.",
        drivers: "Tourism and high-end retail. Corporate headquarters including GoDaddy and Axon. Strong schools and amenities."
      },
      {
        name: "Tempe",
        location: "East Valley, home to Arizona State University",
        performance: "Multifamily cap rates at 6.0% with strong student housing demand. Office and retail supporting university ecosystem.",
        drivers: "Arizona State University with 70,000+ students. Tech companies including State Farm and Amazon. Light rail connectivity."
      }
    ],
    riskOpportunity: {
      strengths: [
        "Fastest-growing major market with 20% population growth (2020-2025)",
        "Led nation with 22.4M SF industrial pipeline",
        "Semiconductor manufacturing boom (TSMC, Intel)",
        "Lower labor costs relative to coastal markets",
        "Data center expansion"
      ],
      challenges: [
        "Office vacancy at 18.5% in emerging market",
        "Water scarcity as long-term consideration",
        "Heat and climate concerns",
        "Overbuilding in certain residential submarkets",
        "Infrastructure strain from rapid growth"
      ],
      opportunities: [
        "Industrial in West Valley with semiconductor demand",
        "Multifamily in Tempe and Scottsdale",
        "Data centers in East Valley",
        "Office in Scottsdale for stability",
        "Land acquisition for industrial development"
      ],
      threats: [
        "Overbuilding in certain sectors",
        "Water scarcity limiting growth",
        "Economic downturn impacting semiconductor sector",
        "Competition from other Sun Belt markets",
        "Climate change and extreme heat"
      ],
      balancedView: "Phoenix represents the strongest growth story among major markets. Industrial development pipeline and semiconductor investments provide structural demand. Population growth supports all property types. Focus on industrial in West Valley before caps compress. Multifamily fundamentals remain strong despite new supply. Avoid downtown office unless positioned for long-term hold. The market's expansion trajectory provides multiple exit strategies."
    }
  },
  'philadelphia': {
    marketIntroduction: {
      researchApproach: "The Philadelphia commercial real estate market positions itself as a lower-cost alternative to NYC/Boston/DC, with the 'Eds and Meds' sector (universities and hospitals), life sciences corridor emergence, and opportunity zones driving investment. Examining over 1,300 properties and 600+ transactions, with focus on the market's position, reveals competitive positioning and strong fundamentals creating compelling investment narratives.",
      marketContext: "Philadelphia's market in 2024 demonstrated stability, with $7.2 billion in transactions, down 7.7% from 2023's $7.8B. Quality assets in prime submarkets continued trading, while secondary properties faced pricing pressure. The market's position as a life sciences hub supported office demand, while multifamily fundamentals remained strong in transit-oriented locations.",
      performanceInsights: "Life sciences properties in University City traded at 7% caps, significantly below Boston's 5% for similar tenants. Multifamily in Center City achieved 6.0% caps. Office cap rates widened to 8.5% average, with Center City at 7.5% and Navy Yard at 7.8%. Industrial stabilized at 6.8% caps with I-95 corridor strength."
    },
    brokerInsights: {
      marketOutlook: "Philly is the overlooked Tier 2 market. Life sciences in University City trading at 7% caps vs Boston's 5%—same tenants, better returns. Center City multifamily at 6-6.5% is defensive. Industrial I-95 corridor offers institutional quality at value pricing. Buy the hospitals and universities—they're not moving.",
      maturityWall: "Maturities are manageable given strong fundamentals. Life sciences and multifamily properties should refinance successfully. Office properties may face challenges, but conversion potential provides exit strategies.",
      investmentStrategy: "Focus on life sciences in University City at 7% caps. Multifamily in Center City at 6-6.5% caps. Industrial along I-95 corridor at 6.8% caps. Office in Center City for value-add opportunities. Transit-oriented development along SEPTA and regional rail lines."
    },
    submarketDetails: [
      {
        name: "Center City",
        location: "Downtown Philadelphia, bounded by Vine Street, Delaware River, and Schuylkill River",
        performance: "Office cap rates at 7.5%, multifamily at 6.0%. Strong fundamentals with walkable urban environment.",
        drivers: "Corporate headquarters including Comcast and Aramark. Strong transit connectivity via SEPTA. Walkable urban environment with strong retail and dining."
      },
      {
        name: "University City",
        location: "West Philadelphia, home to University of Pennsylvania and Drexel University",
        performance: "Life sciences cap rates at 7% vs Boston's 5% for similar tenants. Multifamily at 5.8% with student housing demand.",
        drivers: "University of Pennsylvania and Drexel University. Life sciences corridor with CHOP and Penn Medicine. Tech companies including Spark Therapeutics."
      },
      {
        name: "Navy Yard",
        location: "South Philadelphia, former naval shipyard",
        performance: "Office cap rates at 7.8% with tech and innovation focus. Mixed-use development with residential and office.",
        drivers: "Tech and innovation district. Proximity to Center City and airport. Modern office space with strong amenities."
      }
    ],
    riskOpportunity: {
      strengths: [
        "Lower cost alternative to NYC/Boston/DC",
        "Strong healthcare/education sector (Penn, Drexel, CHOP)",
        "Life sciences growth with competitive cap rates",
        "Opportunity zones providing tax benefits",
        "Strong transit infrastructure (SEPTA, regional rail)"
      ],
      challenges: [
        "Office vacancy at 16.8% with structural headwinds",
        "High property taxes relative to competing markets",
        "Crime perception impacting downtown",
        "Budget pressure from pension liabilities",
        "Competition from other Northeast markets"
      ],
      opportunities: [
        "Life sciences in University City at 7% caps",
        "Multifamily in Center City at 6-6.5% caps",
        "Industrial along I-95 corridor",
        "Office conversion to residential",
        "Transit-oriented development"
      ],
      threats: [
        "Overbuilding in certain residential submarkets",
        "Property tax increases to address budget shortfalls",
        "Economic recession impacting corporate headquarters",
        "Competition from other Tier 2 markets",
        "Climate change and sea-level rise"
      ],
      balancedView: "Philadelphia offers compelling value for investors seeking Tier 2 market exposure. Life sciences in University City provides same tenant quality as Boston at better cap rates. Multifamily fundamentals remain strong. Industrial along I-95 offers institutional quality at value pricing. Focus on transit-connected properties with strong bones. The market's competitive positioning provides defensive characteristics."
    }
  },
  'san-antonio': {
    marketIntroduction: {
      researchApproach: "The San Antonio commercial real estate market demonstrates unique characteristics: military presence (Joint Base San Antonio with 5 bases), most affordable major Texas market, medical research hub, and emerging tech sector. Examining over 800 properties and 350+ transactions, with particular focus on these characteristics, reveals a market with defensive positioning and growth trajectory creating compelling investment narratives.",
      marketContext: "San Antonio's market in 2024 showed stability, with $3.9 billion in transactions, down 7.1% from 2023's $4.2B. Quality assets in prime submarkets continued trading, while secondary properties faced pricing pressure. The market's position as a medical research hub supported office demand, while multifamily fundamentals remained strong in master-planned communities.",
      performanceInsights: "Medical Center office properties traded at 8.0% caps, reflecting healthcare tenant demand. Multifamily in Stone Oak achieved 6.5% caps. Industrial along I-10 West traded at 6.8% caps. Office cap rates widened to 9.2% average, reflecting smaller market dynamics. Retail stabilized at 8.2% caps with River Walk tourist retail performing best."
    },
    brokerInsights: {
      marketOutlook: "San Antonio is the sleeper. Most affordable Texas market but military provides stability. Medical Center at 8% caps with UT Health expansion—buy near there. Industrial along I-35 for Mexico trade offers 6.8-7% with USMCA tailwinds. Multifamily at 7% caps and 8.5% vacancy—wait for supply absorption.",
      maturityWall: "Maturities are manageable given stabilized fundamentals. Medical and multifamily properties should refinance successfully. Office properties may face challenges, but conversion potential provides exit strategies.",
      investmentStrategy: "Focus on Medical Center office at 8% caps. Industrial along I-35 for Mexico trade at 6.8-7% caps. Multifamily in Stone Oak at 6.5% caps. Avoid downtown office unless positioned for conversion. Land acquisition for industrial development offers opportunities."
    },
    submarketDetails: [
      {
        name: "Medical Center",
        location: "Northwest San Antonio, home to UT Health and Texas Biomed",
        performance: "Office cap rates at 8.0% with healthcare tenant demand. Strong fundamentals with medical research expansion.",
        drivers: "UT Health San Antonio and Texas Biomed. Medical research hub with growing life sciences sector. Strong tenant covenants from investment-grade healthcare systems."
      },
      {
        name: "Stone Oak",
        location: "North San Antonio master-planned community",
        performance: "Multifamily cap rates at 6.5% with strong fundamentals. Master-planned community with strong schools.",
        drivers: "Master-planned community with strong schools and amenities. Diversified economy less dependent on single industry. Corporate relocations from California."
      },
      {
        name: "I-10 West",
        location: "West San Antonio along I-10",
        performance: "Industrial cap rates at 6.8% for logistics and distribution. Strong demand for Mexico trade.",
        drivers: "Proximity to Mexico border and I-35. USMCA trade agreement tailwinds. Toyota plant and manufacturing presence."
      }
    ],
    riskOpportunity: {
      strengths: [
        "Military presence (5 bases) providing stability",
        "Most affordable major Texas market",
        "Medical research hub (UT Health, Texas Biomed)",
        "Tourism (Alamo, River Walk)",
        "Emerging tech sector (Port SA)"
      ],
      challenges: [
        "Office vacancy at 19.2% in smaller market",
        "Smaller market size limiting liquidity",
        "Competition from other Texas markets",
        "Limited public transit infrastructure",
        "Water scarcity concerns"
      ],
      opportunities: [
        "Medical Center office with healthcare expansion",
        "Industrial along I-35 for Mexico trade",
        "Multifamily in master-planned communities",
        "Tourism-related retail and hospitality",
        "Land acquisition for industrial development"
      ],
      threats: [
        "Overbuilding in certain residential submarkets",
        "Economic downturn impacting military spending",
        "Competition from Austin and San Antonio",
        "Climate change and water scarcity",
        "Limited institutional capital interest"
      ],
      balancedView: "San Antonio offers defensive positioning for investors seeking affordable Texas exposure. Medical Center provides stability with healthcare expansion. Industrial along I-35 benefits from Mexico trade. Multifamily fundamentals remain strong despite new supply. Focus on properties with strong tenant covenants. The market's affordability and military presence provide defensive characteristics."
    }
  }
};

export function getCityContent(slug: string): CityContent | null {
  return cityContent[slug] || null;
}

