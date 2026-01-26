import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ModifyPlanModal } from "../components/planmod";

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

export default function PlanDetails({ userData }: { userData?: any[] }) {
    return (
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
                    <ModifyPlanModal currentCredits={user[0].credits} currentPlan={user[0].plan} />
                </CardFooter>
                
                </div>
            </CardContent>
        </Card>
    )
}