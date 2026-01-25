import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import SideNav from "@/components/ui/sidenav"


//Example wallet data!
const walletData = {
  // --- public.asset tábla adatai ---
  id: "42",                 // asset.id (BigInt stringként jön át biztonságosan)
  wallet_id: "10",          // asset.wallet_id
  
  // A diagram szerint a currency egy külön tábla (public.currency), 
  // amit itt "kicsomagolva" adunk át a frontendnek
  currency: {
    symbol: "HUF",          // currency.symbol
    name: "Hungarian Forint", // currency.name
    precision: 2            // currency.precision (osztó: 100)
  },

  // asset.amount (int8) -> Az aktuális egyenleg fillérben/centben tárolva!
  // A frontend feladata: 1545000 / 10^2 = 15,450.00
  rawBalance: 1545000,      
  
  // Segédmező a frontendnek (számított érték)
  formattedBalance: 15450.00, 

  // --- public.transaction tábla adatai (kapcsolódva az asset_id-hoz) ---
  transactions: [
    {
      id: "101",            // transaction.id
      created_at: "2024-01-15T08:30:00Z", // transaction.created_at
      updated_at: "2024-01-15T08:35:00Z", // transaction.updated_at
      
      // transaction.amount (int8) - mindig pozitív egész szám
      rawAmount: 5000000,   
      displayAmount: 50000.00, // (rawAmount / 100)
      
      // transaction.direction (ENUM) - Ez mondja meg, hogy + vagy -
      direction: "INCOMING", 
      
      // transaction.status (ENUM) - Fontos a UI színezéséhez
      status: "COMPLETED",
      
      // Mivel a diagramon NINCS 'description' oszlop a transaction táblában,
      // ezt jellemzően a 'type' vagy kapcsolt táblák alapján generálja a backend/frontend.
      // Ide most beírtam statikusan.
      computedDescription: "Befizetés" 
    },
    {
      id: "102",
      created_at: "2024-01-20T14:15:00Z",
      updated_at: "2024-01-20T14:15:00Z",
      
      rawAmount: 455000,    // 4550.00 HUF
      displayAmount: 4550.00,
      
      direction: "OUTGOING", 
      status: "COMPLETED",
      computedDescription: "Kifizetés (Order #123)"
    },
    {
      id: "103",
      created_at: "2024-02-10T09:00:00Z",
      updated_at: "2024-02-10T09:01:00Z",
      
      rawAmount: 2000000,   // 20000.00 HUF
      displayAmount: 20000.00,
      
      direction: "INCOMING",
      status: "PENDING",    // Folyamatban lévő tranzakció
      computedDescription: "Függő jóváírás"
    }
  ]
};

const dashboardAssets = [
  // 1. A te eredeti HUF adatod (Listanézethez igazítva)
  {
    id: "42",
    symbol: "HUF",
    name: "Hungarian Forint",
    precision: 2,           // currency.precision
    rawBalance: 1545000,    // asset.amount (int8)
    currentPrice: 1,        // Bázis deviza lévén az ára 1
    change24h: 0.00,        // Nincs árfolyam ingadozás a bázishoz képest
  },
  // 2. Egy generált BTC adat (hogy legyen mit listázni)
  {
    id: "99",
    symbol: "BTC",
    name: "Bitcoin",
    precision: 8,           // A Bitcoin általában 8 tizedesjegy
    rawBalance: 45000000,   // 0.45 BTC (45000000 / 10^8)
    currentPrice: 15000000, // 1 BTC = 15.000.000 HUF (árfolyam példa)
    change24h: 2.34,        // +2.34% növekedés
  },
  // 3. Egy generált USD adat
  {
    id: "55",
    symbol: "USD",
    name: "US Dollar",
    precision: 2,
    rawBalance: 12500,      // $125.00
    currentPrice: 360,      // 1 USD = 360 HUF
    change24h: -0.5,        // -0.5% csökkenés
  }
];

export default function WalletPage() {

    const divisor = Math.pow(10, walletData.currency.precision);
    const amount = walletData.rawBalance / divisor;

    const formattedBalance = new Intl.NumberFormat('hu-HU', { 
    style: 'currency', 
    currency: walletData.currency.symbol 
    }).format(amount);


  return(
    <div>

        <div className="max-w-[80vw] mx-auto my-10 px-4">
            <div className="grid grid-cols-[250px_1fr] gap-6">

                <SideNav />

                <main className="text-lg">

                        <Card className="w-full col-span-2 shadow-lg border-gray-200 overflow-hidden mb-10">
                            <ItemGroup className="px-6">
                                {
                                <Item>
                                    <div className="flex items-center gap-8">
                                    <ItemContent className="space-y-1">
                                        <ItemTitle className="text-4xl mb-2 font-extrabold text-gray-900 tracking-tight">
                                            Estimated Balance
                                        </ItemTitle>
                                        <div className="flex items-center gap-2">
                                        <ItemDescription className="text-lg font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {formattedBalance}
                                        </ItemDescription>
                                        </div>
                                    </ItemContent>
                                    </div>
                                </Item>
                                }
                            </ItemGroup>
                            </Card>

                        <Card className="w-full shadow-lg border-gray-200 overflow-hidden my-10">
                            <CardHeader className="text-left pb-2">
                                <CardTitle className="text-2xl font-bold text-gray-800">Your Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                
                                <div className="flex flex-col">
    {/* Oszlopok fejléce */}
    <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      <div className="col-span-1">Eszköz</div>
      <div className="text-right">Árfolyam</div>
      <div className="text-right">Egyenleg</div>
      <div className="text-right">Érték (HUF)</div>
    </div>

    {/* Lista renderelése */}
    <div className="divide-y divide-gray-100">
      {dashboardAssets.map((asset) => {
        // --- SZÁMÍTÁSOK (Assetenként) ---
        
        // 1. Valós mennyiség kiszámolása (int8 / 10^precision)
        const realBalance = asset.rawBalance / Math.pow(10, asset.precision);
        
        // 2. Érték kiszámolása (Mennyiség * Árfolyam)
        const totalValue = realBalance * asset.currentPrice;

        return (
          <div key={asset.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors">
            
            {/* 1. Oszlop: Ikon, Szimbólum, Név */}
            <div className="col-span-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {asset.symbol[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900">{asset.symbol}</div>
                <div className="text-xs text-gray-500 hidden sm:block">{asset.name}</div>
              </div>
            </div>

            {/* 2. Oszlop: Jelenlegi ár + Napi mozgás */}
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {new Intl.NumberFormat('hu-HU').format(asset.currentPrice)} Ft
              </div>
              <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
              </div>
            </div>

            {/* 3. Oszlop: Egyenleg (Balance) */}
            <div className="text-right text-gray-700 font-mono text-sm">
              {realBalance.toLocaleString(undefined, { maximumFractionDigits: asset.precision })} {asset.symbol}
            </div>

            {/* 4. Oszlop: Összérték (Total Value) */}
            <div className="text-right font-bold text-gray-900">
               {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(totalValue)}
            </div>
            
          </div>
        );
      })}
    </div>
  </div>
                            </CardContent>
                        </Card>

                        <Card className="w-full shadow-lg border-gray-200 overflow-hidden ">
                            <CardHeader className="text-left pb-2">
                                    <CardTitle className="w-full text-2xl font-bold text-gray-800">Transaction History</CardTitle>
                            </CardHeader>
                        </Card>
                </main>

            </div>
        </div>
    </div>
  )
}