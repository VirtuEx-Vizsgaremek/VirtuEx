import Image from "next/image"
import SideNav from "@/components/sidenav";

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

import { Button } from "@/components/ui/button"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

//Example profile data!
const user = [
  {
    name: "John Doe",
    id: 12,
    email: "ex@exa.com",
    password: "3:45",
    premium: true,
    expire: "2024-12-31",
    plan: "Pro",
    credits: 1500
  }];


export default function ProfilePage() {
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

                        <Card className="flex flex-col shadow-lg border-gray-200">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl font-bold text-gray-800">Account Details</CardTitle>
                            </CardHeader>
                            
                            <CardContent className="min-h-[400px] flex flex-col pt-6">
                                <form action="" className="flex flex-col flex-grow">
                                <div className="space-y-8 flex-grow">
                                    
                                    <Field className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        defaultValue="John Doe"
                                        placeholder="Teljes név"
                                        className="w-full px-4 py-2"
                                        required
                                    />
                                    </Field>
                                    
                                    <Field className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Email Address
                                    </Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        defaultValue="john.doe@example.com"
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-2"
                                        required
                                    />
                                    <FieldDescription className="text-xs text-gray-400">
                                        Ezt az e-mail címet használjuk a bejelentkezéshez.
                                    </FieldDescription>
                                    </Field>
                                    
                                    <Field className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                                    <span className="font-mono text-sm text-gray-600">
                                        {new Date().toLocaleDateString('hu-HU')}
                                    </span>
                                    </Field>

                                </div>

                                <CardFooter className="flex flex-row justify-center gap-4 mt-auto pt-8 px-0">
                                    <Button 
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 transition-colors"
                                    >
                                    Save Changes
                                    </Button>
                                    <Button 
                                    variant="outline" 
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                    >
                                    Log Out
                                    </Button>
                                </CardFooter>
                                </form>
                            </CardContent>
                            </Card>

                        <Card className="flex flex-col shadow-lg border-gray-200">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl font-bold text-gray-800">Plan Details</CardTitle>
                            </CardHeader>

                            <CardContent className="min-h-[400px] flex flex-col pt-6">
                                <div className="flex flex-col flex-grow">
                                
                                <div className="space-y-6 flex-grow">
                                    {user.map((u) => (
                                    <div key={u.id} className="space-y-6">
                                        
                                        <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Premium Status</p>
                                        <div className={`text-lg font-medium ${u.premium ? "text-green-600" : "text-gray-500"}`}>
                                            {u.premium ? "● Active" : "○ Inactive"}
                                        </div>
                                        </div>

                                        <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</p>
                                        <p className="text-lg text-gray-800 font-mono">{u.expire}</p>
                                        </div>

                                        <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Plan Type</p>
                                        <p className="text-lg text-gray-800">{u.plan}</p>
                                        </div>

                                        <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Available Credits</p>
                                        <p className="text-3xl font-bold text-blue-600">{u.credits}</p>
                                        </div>

                                    </div>
                                    ))}
                                </div>

                                <CardFooter className="flex justify-center mt-auto pt-8 px-0">
                                    <Button 
                                    variant="default" 
                                    className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-10 py-6 text-lg font-semibold transition-all shadow-md"
                                    
                                    >
                                    Modify
                                    </Button>
                                </CardFooter>
                                
                                </div>
                            </CardContent>
                        </Card>

                </main>
            </div>
        </div>
    </div>
  );
}