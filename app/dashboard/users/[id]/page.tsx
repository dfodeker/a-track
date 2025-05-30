import { notFound, redirect } from 'next/navigation'
import {prisma} from '@/lib/prisma'

import Link from 'next/link'
import { assignSoftware, removeAssignedSoftware } from '@/actions/user_actions'
import { createClient } from '@/utils/supabase/server'
import { findRealUser } from '@/lib/queries'
import SharedAccounts from './shared-accounts'
import EmployeeProfile from '../employee-profile'
import { Badge } from '@/components/ui/badge'
import { User } from '@prisma/client'
import EditUser from './edit-user'
export default async function Page({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        reportsTo: true,
        Location: true,
        headedDepartments: true,
        Department: true,
       
      },
    })
    if (!user) {
      return notFound()
    }
 console.log(user)

    const software = await prisma.userSoftware.findMany({
      where: {
        userId: id,
      },
      include: {
        user: true,
        grantedBy: true,
        software: true,
      },
    })
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    const assignedSoftware = software.map((s) => ({
        id: s.software.id,
      }));
      const assignedSoftwareIds = assignedSoftware.map((s) => s.id);
      
      const availableSoftware = await prisma.software.findMany({
         where: {
             id: {
                 notIn: assignedSoftwareIds,
             },
           },
         orderBy: {
             name: 'asc',
         },
        
 
      });
      const users = await prisma.user.findMany({
        orderBy: {
            name: 'asc',
        },
        where: {id: {not: id}}
      });
     
      const locations = await prisma.location.findMany({
        orderBy: {
            name: 'asc',
        },
      });

      //have software.grantedBy
      //if we have that we want to search our list of auth users for a match and show their details not current user
    
    
    return <>
        <div>

       

        ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            <h1 className='text-2xl font-bold'>{user.name}</h1>
            
            <p className="text-green-700">Department: {user.department}</p>
            <p className="text-green-700">Job Title: {user.jobTitle}</p>
            <p className="text-green-700">Email: {user.email}</p>
            <p className="text-green-700">Location: {user.Location?.name}</p>
            <p className="text-green-700">Reports To: {user.reportsTo?.name}</p>

           <Badge>{user.status}</Badge>
        </div>

<EditUser user={user as User & {reportsTo: User}}  authId={data.user.id} users={users} locations={locations} departments={departments} />

        ===============================
        <h1>Software</h1>

        <div>
      {software.map(async (software) => {
        const removeAssignedSoftwareWithIds = removeAssignedSoftware.bind(null, id, software.software.id);
        const grantedBy= await findRealUser(software.grantedById);
        
        return (
          <div key={software.id}>
            <Link href={`/dashboard/software/${software.software.id}`} prefetch={true}>
              <h2>{`---> ${software.software.name}`}</h2>
            </Link>
            <p className="text-green-700">{software.software.description}</p>
            <p className="text-green-700">Granted By: {grantedBy.email}</p>
            <p className="text-green-700">Access Level: {software.accessLevel}</p>
            <p className="text-green-700">Role: {software.role}</p>
           
            <form action={removeAssignedSoftwareWithIds} className="flex flex-col gap-4">
              <button type="submit">Remove</button>
            </form>
          </div>
        );
      })}
    </div>

        ============================
        {/* Assign software */}
       

        <h2>Assign Software</h2>
        <form action={assignSoftware} className='flex flex-col gap-4'>
            <select name="softwareId">
                {availableSoftware.map((software) => (
                    <option key={software.id} value={software.id}>{software.name}</option>
                ))}
            </select>
            <input type="text" name="grantedById"  defaultValue={data.user.id} hidden />
            {/* <select name="grantedById" className='flex flex-col gap-4'>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select> */}
            
            <input type="text" name="accessLevel" placeholder="Access Level*" />
            <input type="text" name="role" placeholder="Role*" />
            <input type="text" name="userId" defaultValue={id} hidden />
            <button type="submit">Assign Software +</button>
        </form>
        ============================

        <SharedAccounts id={id} authId={data.user.id} />

        ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        <EmployeeProfile />



    </>
  }



  //tablou fe769674-65d0-4528-92af-2f2df451164e
  //derek 50313f26-7397-4d88-9e37-937c212d8eb2



