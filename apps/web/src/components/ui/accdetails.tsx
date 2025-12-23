import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDescription } from "@/components/ui/field";



export default function AccDetails({ userData }: { userData?: any[] }) {
  return (
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
                    defaultValue={userData?.[0]?.name || "John Doe"}
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
                    defaultValue={userData?.[0]?.email || "john.doe@example.com"}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2"
                    required
                />
                <FieldDescription className="text-xs text-gray-400">
                    This email address is used for account-related notifications.
                </FieldDescription>
                </Field>
                
                <Field className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                <span className="font-mono text-sm text-gray-600">
                    {new Date(userData?.[0]?.registrationDate).toLocaleDateString('hu-HU')}
                    
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
  );
}