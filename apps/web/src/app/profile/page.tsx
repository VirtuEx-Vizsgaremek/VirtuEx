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
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDescription } from "@/components/ui/field";



export default function ProfilePage() {
  // Mock user data - in the future this will be fetched via API (e.g., getUser())
  const user = [
    {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      registrationDate: "2024-01-15T10:30:00Z",
      premium: true,
      expire: "2025-12-31",
      plan: "Pro",
      credits: 1500,
      password: "hashed_password_here"
    }
  ];

  function isPremiumUser(user: any) {
    if(user.premium) {
      return(
        <div className="userStat">
          <span className="font-semibold text-green-600">Premium User</span>
        </div>
      )
    }
    else {
      return(
        <div className="userStat">
          <span className="font-semibold text-gray-600">Free User</span>
        </div>
      )
    }
  }

  return(
    <div>
        <div className="max-w-[80vw] mx-auto my-10 px-4">
            <div className="grid grid-cols-[250px_1fr] gap-6">
                
                <SideNav />
                
                <main className="grid grid-cols-1 grid-rows-[auto_1fr] text-lg">

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
                                                {u.username}
                                            </span>
                                            
                                          </div>
                                      </ItemContent>
                                      <ItemContent className="ml-auto">
                                        {isPremiumUser(u)}
                                      </ItemContent>
                                    </div> 
                                </Item>
                                ))}
                            </ItemGroup>
                        </Card>

                        <Card className="flex flex-col shadow-lg border-gray-200 mt-10">
                          <CardHeader className="text-left pb-2">
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
                                        defaultValue={user?.[0]?.name}
                                        placeholder="Your Full Name"
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
                                        defaultValue={user?.[0]?.email}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-2"
                                        required
                                    />
                                  </Field>

                                  <div className="flex flex-col gap-4">
                                    <div>
                                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        Change Password
                                      </Button>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                      <Button 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 transition-colors"
                                      >
                                        Backup Code
                                      </Button>
                                      <Button 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 transition-colors"
                                      >
                                        Remove 2FA
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <Field className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                                    <span className="font-mono text-sm text-gray-600">
                                        {new Date(user?.[0]?.registrationDate).toLocaleDateString('hu-HU')}
                                        
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
                                    <Button className="bg-red-700 hover:bg-red-600 text-white px-8 transition-colors">
                                      Delete Account
                                    </Button>
                                </CardFooter>
                              </form>

                          </CardContent>
                      </Card>
                        

                </main>
            </div>
        </div>
    </div>
  );
}
// Half acc display
// Change pass dialog
// Acc delete dialog