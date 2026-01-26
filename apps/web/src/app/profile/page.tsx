import Image from "next/image"
import SideNav from "@/components/sidenav";
import AccDetails from "@/components/ui/accdetails";
import PlanDetails from "@/components/plandetails";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export default function ProfilePage() {
  // Mock user data - in the future this will be fetched via API (e.g., getUser())
  const user = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      registrationDate: "2024-01-15T10:30:00Z",
      premium: true,
      expire: "2025-12-31",
      plan: "Pro",
      credits: 1500
    }
  ];

  return(
    <div>
        <div className="max-w-[80vw] mx-auto my-10 px-4">
            <div className="grid grid-cols-[250px_1fr] gap-6">
                
                <SideNav />
                
                <main className="grid grid-cols-2 grid-rows-[auto_1fr] gap-10 text-lg">

                        <Card className="w-full col-span-2 shadow-lg border-gray-200 overflow-hidden ">
                            <ItemGroup className="px-6">
                                {user.map((u) => (
                                <Item key={u.id} asChild role="listitem">
                                    <div className="flex items-center gap-8">
                                    <ItemMedia className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-gray-50 shadow-sm flex-shrink-0">
                                        <Image
                                        src={`https://avatar.vercel.sh/${u.id}`}
                                        alt={u.name}
                                        width={100}
                                        height={100}
                                        className="object-cover grayscale transition-transform hover:scale-105 duration-300"
                                        />
                                    </ItemMedia>
                                    <ItemContent className="space-y-1">
                                        <ItemTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                        {u.name}
                                        </ItemTitle>
                                        <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            User Identifier
                                        </span>
                                        <ItemDescription className="text-lg font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            #{u.id}
                                        </ItemDescription>
                                        </div>
                                    </ItemContent>
                                    </div>
                                </Item>
                                ))}
                            </ItemGroup>
                        </Card>

                        <AccDetails userData={user}/>
                        <PlanDetails userData={user} />           
                        

                </main>
            </div>
        </div>
    </div>
  );
}