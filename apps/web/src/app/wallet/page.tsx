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
  id: "42",         
  wallet_id: "10",          

  currency: {
    symbol: "HUF",          
    name: "Hungarian Forint", 
    precision: 2            
  },

  rawBalance: 1545000,      
  formattedBalance: 15450.00, 

  transactions: [
    {
      id: "101",        
      created_at: "2024-01-15T08:30:00Z",
      updated_at: "2024-01-15T08:35:00Z", 
      rawAmount: 5000000,   
      displayAmount: 50000.00,
      direction: "INCOMING", 
      status: "COMPLETED",
      computedDescription: "Befizetés" 
    },
    {
      id: "102",
      created_at: "2024-01-20T14:15:00Z",
      updated_at: "2024-01-20T14:15:00Z",
      rawAmount: 455000, 
      displayAmount: 4550.00,
      direction: "OUTGOING", 
      status: "COMPLETED",
      computedDescription: "Kifizetés (Order #123)"
    },
    {
      id: "103",
      created_at: "2024-02-10T09:00:00Z",
      updated_at: "2024-02-10T09:01:00Z",
      rawAmount: 2000000,
      displayAmount: 20000.00,
      direction: "INCOMING",
      status: "PENDING", 
      computedDescription: "Függő jóváírás"
    }
  ]
};

const dashboardAssets = [
  {
    id: "42",
    symbol: "HUF",
    name: "Hungarian Forint",
    precision: 2,        
    rawBalance: 1545000,  
    currentPrice: 1,       
    change24h: 0.00,        
  },
  {
    id: "99",
    symbol: "BTC",
    name: "Bitcoin",
    precision: 8,           
    rawBalance: 45000000, 
    currentPrice: 15000000, 
    change24h: 2.34,        
  },
  {
    id: "55",
    symbol: "USD",
    name: "US Dollar",
    precision: 2,
    rawBalance: 12500,      
    currentPrice: 360,      
    change24h: -0.5,        
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

                              <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500    uppercase tracking-wider">
                                <div className="col-span-1">Asset</div>
                                <div className="text-right">Price</div>
                                <div className="text-right">Balance</div>
                                <div className="text-right">Value (HUF)</div>
                              </div>

                              <div className="divide-y divide-gray-100">
                                {dashboardAssets.map((asset) => {

                                  const realBalance = asset.rawBalance / Math.pow(10, asset.precision);

                                  const totalValue = realBalance * asset.currentPrice;

                                  return (
                                    <div key={asset.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors">

                                      <div className="col-span-1 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                          {asset.symbol[0]}
                                        </div>
                                        <div>
                                          <div className="font-bold text-gray-900">{asset.symbol}</div>
                                          <div className="text-xs text-gray-500 hidden sm:block">{asset.name}</div>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <div className="font-medium text-gray-900">
                                          {new Intl.NumberFormat('hu-HU').format(asset.currentPrice)} Ft
                                        </div>
                                        <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                                        </div>
                                      </div>

                                      <div className="text-right text-gray-700 font-mono text-sm">
                                        {realBalance.toLocaleString(undefined, { maximumFractionDigits: asset.precision })} {asset.symbol}
                                      </div>

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