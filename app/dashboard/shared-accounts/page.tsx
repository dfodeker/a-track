import { createSharedAccount } from "@/actions/sharedAccount_actions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SharedAccountsPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    
    if (error || !data?.user) {
      redirect('/login')
    }
    const sharedAccounts = await prisma.sharedAccount.findMany({
        orderBy: {
            name: 'asc',
        },
        
    });
    return (
        <div className="flex flex-col gap-4 p-3">
            <h1>Shared Accounts</h1>
           
            {sharedAccounts.length > 0 ? sharedAccounts.map((sharedAccount) => (
                <div key={sharedAccount.id}>
                   <Link href={`/dashboard/shared-accounts/${sharedAccount.id}`}> <h2 className="font-bold text-lg">{sharedAccount.name}</h2></Link>
                    <p>{sharedAccount.email}</p>
                    <p>{sharedAccount.location}</p>
                    <p>{sharedAccount.type}</p>
                    <p>{sharedAccount.status}</p>
                </div>
            )) : <p>No shared accounts found</p>}
===================
            <h2 className="font-bold text-lg">Create Shared Account</h2>
            <form action={createSharedAccount} className="flex flex-col gap-2">
                <input type="text" name="name" placeholder="Name" />
                <input type="text" name="email" placeholder="Email" />
                <input type="text" name="location" placeholder="Location" />
                <input type="text" name="type" placeholder="Type" />
                <input type="text" name="status" placeholder="Status" />
                <input type="text" name="updatedBy"  defaultValue={data.user.id} hidden />
                <button type="submit">Create Shared Account</button>
            </form>
        </div>
    );
}
